import hashlib
import hmac
import json
import random
from typing import Optional
from urllib.parse import parse_qsl

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models, transaction
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    CardGroup,
    CardSettings,
    CardTemplate,
    CollectionCard,
    UserProfile,
    WithdrawRequest,
)
from .serializers import (
    CardSerializer,
    StarsInvoiceSerializer,
    TelegramAuthSerializer,
    UserProfileSerializer,
    WithdrawCreateSerializer,
    WithdrawRequestSerializer,
)

User = get_user_model()


# def verify_telegram_init_data(init_data: str) -> Optional[dict]:
#     if not init_data:
#         return None
#     data = dict(parse_qsl(init_data, keep_blank_values=True))
#     incoming_hash = data.pop('hash', None)
#     if not incoming_hash:
#         return None
#     data_check_string = '\n'.join(f"{k}={v}" for k, v in sorted(data.items()))
#     secret_key = hashlib.sha256(settings.TELEGRAM_BOT_TOKEN.encode()).digest()
#     calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
#     if not hmac.compare_digest(calculated_hash, incoming_hash):
#         return None
#     return data



def verify_telegram_init_data(init_data: str) -> Optional[dict]:
    """
    Верификация initData из Telegram WebApp.
    Алгоритм:
      1) Парсим query-string в dict
      2) Достаём и запоминаем hash
      3) Формируем data_check_string из остальных пар key=value (отсортированных по key)
      4) secret_key = HMAC_SHA256(key='WebAppData', msg=BOT_TOKEN)
      5) calculated_hash = HMAC_SHA256(key=secret_key, msg=data_check_string)
      6) сравниваем с hash
    """
    if not init_data:
        return None

    # Разбор строки вида "query_id=...&user=...&auth_date=...&hash=..."
    data = dict(parse_qsl(init_data, keep_blank_values=True))

    incoming_hash = data.pop('hash', None)
    if not incoming_hash:
        return None

    # Строка для подписи: key=value\nkey=value...
    data_check_string = '\n'.join(
        f"{k}={v}" for k, v in sorted(data.items())
    )

    # Шаг 3–4 по докам: secret_key = HMAC_SHA256("WebAppData", bot_token)
    secret_key = hmac.new(
        key=b'WebAppData',
        msg=settings.TELEGRAM_BOT_TOKEN.encode(),
        digestmod=hashlib.sha256,
    ).digest()

   

    # Шаг 5: hash = HMAC_SHA256(secret_key, data_check_string)
    calculated_hash = hmac.new(
        key=secret_key,
        msg=data_check_string.encode(),
        digestmod=hashlib.sha256,
    ).hexdigest()

   

    # Сравнение
    if not hmac.compare_digest(calculated_hash, incoming_hash):
        # Можно оставить лог, если нужно дебажить:
        # print("HASH MISMATCH:", calculated_hash, "!=", incoming_hash)
        return None

    return data


class TelegramAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        
        serializer = TelegramAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        parsed_data = verify_telegram_init_data(serializer.validated_data['init_data'])
        if not parsed_data:
            return Response({'detail': 'Не удалось подтвердить данные Telegram'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_payload = json.loads(parsed_data.get('user', '{}'))
        except json.JSONDecodeError:
            return Response({'detail': 'Некорректные данные пользователя'}, status=status.HTTP_400_BAD_REQUEST)

        if not user_payload:
            return Response({'detail': 'Пустые данные пользователя'}, status=status.HTTP_400_BAD_REQUEST)

        username = user_payload.get('username') or f"tg_{user_payload['id']}"
        defaults = {
            'first_name': user_payload.get('first_name', ''),
            'last_name': user_payload.get('last_name', ''),
            
        }
        user, _ = User.objects.get_or_create(username=username, defaults=defaults)
        updated = False
        for field, value in defaults.items():
            if getattr(user, field) != value:
                setattr(user, field, value)
                updated = True
        if updated:
            user.save(update_fields=['first_name', 'last_name'])

        profile, _ = UserProfile.objects.get_or_create(user=user)
        updated_fields = []
        if profile.telegram_id != str(user_payload['id']):
            profile.telegram_id = str(user_payload['id'])
            updated_fields.append('telegram_id')

        stars_balance = parsed_data.get('tg_web_app_star_count') or parsed_data.get('stars', 0)
        try:
            stars_balance_value = int(stars_balance)
        except (TypeError, ValueError):
            stars_balance_value = 0
        if stars_balance_value and profile.telegram_stars_balance != stars_balance_value:
            profile.telegram_stars_balance = stars_balance_value
            updated_fields.append('telegram_stars_balance')

        start_param = parsed_data.get('start_param') or parsed_data.get('start')
        if start_param and start_param.startswith('ref_') and not profile.referred_by:
            referral_code = start_param.replace('ref_', '', 1)
            inviter_profile = UserProfile.objects.filter(referral_code=referral_code).first()
            if inviter_profile and inviter_profile != profile:
                profile.referred_by = inviter_profile
                updated_fields.append('referred_by')
                inviter_profile.referrals_count = models.F('referrals_count') + 1
                inviter_profile.save(update_fields=['referrals_count'])

        if updated_fields:
            profile.save(update_fields=updated_fields)
        else:
            profile.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'profile': UserProfileSerializer(profile).data,
            }
        )


class ProfileView(APIView):
    def get(self, request, *args, **kwargs):
        profile = request.user.profile
        data = UserProfileSerializer(profile).data
        data['referral_link'] = f"https://t.me/{settings.TELEGRAM_BOT_NAME}?start=ref_{profile.referral_code}"
        data['cards_opened'] = CollectionCard.objects.filter(user=request.user).count()
        data['cards_total'] = CardTemplate.objects.count()
        data['cards_groups'] = (
            CollectionCard.objects.filter(user=request.user)
            .values('template__group__name')
            .annotate(count=models.Count('id'))
        )
        settings_instance = CardSettings.objects.first()
        data['card_open_price'] = settings_instance.open_price if settings_instance else 0
        return Response(data)


class CollectionView(APIView):
    def get(self, request, *args, **kwargs):
        cards = CollectionCard.objects.filter(user=request.user).order_by('title')
        serializer = CardSerializer(cards, many=True, context={'request': request})
        return Response({'cards': serializer.data})

    def post(self, request, *args, **kwargs):
        groups = list(CardGroup.objects.all())
        if not groups:
            return Response({'detail': 'Группы карточек не настроены'}, status=status.HTTP_400_BAD_REQUEST)
        weights = [group.drop_chance for group in groups]
        selected_group = random.choices(groups, weights=weights, k=1)[0]

        settings_instance = CardSettings.objects.first()
        if not settings_instance:
            settings_instance = CardSettings.objects.create()

        profile = request.user.profile
        price = settings_instance.open_price
        if profile.stars_balance < price:
            return Response({'detail': 'Недостаточно звёзд для открытия карточки'}, status=status.HTTP_400_BAD_REQUEST)

        templates = list(selected_group.templates.all())
        if not templates:
            return Response({'detail': 'В выбранной группе нет карточек'}, status=status.HTTP_400_BAD_REQUEST)

        template = random.choice(templates)
        card, _ = CollectionCard.objects.get_or_create(
            user=request.user,
            template=template,
            defaults={
                'title': template.title,
                'rarity': template.rarity,
                'image': template.image,
                'animation': template.animation,
            },
        )

        profile.cards_opened = models.F('cards_opened') + 1
        profile.stars_balance = models.F('stars_balance') - price
        profile.save(update_fields=['cards_opened', 'stars_balance'])
        profile.refresh_from_db()

        serializer = CardSerializer(card, context={'request': request})
        return Response({'card': serializer.data, 'group': selected_group.name, 'price': price})


class WithdrawView(APIView):
    def get(self, request, *args, **kwargs):
        withdraws = WithdrawRequest.objects.filter(user=request.user).order_by('-created_at')
        serializer = WithdrawRequestSerializer(withdraws, many=True)
        return Response({'history': serializer.data})

    def post(self, request, *args, **kwargs):
        serializer = WithdrawCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            profile = request.user.profile
            amount = serializer.validated_data['stars_amount']
            profile.stars_withdrawable -= amount
            profile.save(update_fields=['stars_withdrawable'])
            withdraw = WithdrawRequest.objects.create(
                user=request.user,
                stars_amount=amount,
                recipient_username=serializer.validated_data['recipient_username'],
            )
        return Response(WithdrawRequestSerializer(withdraw).data, status=status.HTTP_201_CREATED)


class StarsInvoiceView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = StarsInvoiceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        amount = serializer.validated_data['stars_amount']
        payload = f"stars:{amount}:{request.user.pk}"
        return Response(
            {
                'currency': 'XTR',
                'amount': amount,
                'title': 'Покупка звёзд',
                'description': 'Пополнение баланса звёзд в мини-приложении',
                'payload': payload,
                'provider_token': settings.TELEGRAM_PAYMENT_PROVIDER_TOKEN,
            }
        )
