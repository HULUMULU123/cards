import hashlib
import hmac
import json
import random
from typing import Optional
from urllib.parse import parse_qsl

import requests
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
    if not getattr(settings, 'TELEGRAM_BOT_TOKEN', ''):
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
def fetch_external_balance(user_id: str) -> Optional[int]:
    api_key = getattr(settings, 'BALANCE_API_KEY', '')
    base_url = getattr(settings, 'BALANCE_API_BASE_URL', '')
    if not api_key or not base_url or not user_id:
        return None
    url = f"{base_url.rstrip('/')}/{user_id}"
    headers = {'X-API-Key': api_key}
    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code != 200:
            return None
        payload = response.json()
        return int(payload.get('balance', 0))
    except (requests.RequestException, ValueError, TypeError):
        return None


def debit_external_balance(user_id: str, amount: int) -> Optional[int]:
    api_key = getattr(settings, 'BALANCE_API_KEY', '')
    base_url = getattr(settings, 'BALANCE_API_BASE_URL', '')
    if not api_key or not base_url or not user_id or amount <= 0:
        return None
    url = f"{base_url.rstrip('/')}/{user_id}/debit"
    headers = {'X-API-Key': api_key, 'Content-Type': 'application/json'}
    payload = {'amount': amount}
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=5)
        if response.status_code != 200:
            return None
        payload = response.json()
        return int(payload.get('balance', 0))
    except (requests.RequestException, ValueError, TypeError):
        return None


def credit_external_balance(user_id: str, amount: int) -> Optional[int]:
    api_key = getattr(settings, 'BALANCE_API_KEY', '')
    base_url = getattr(settings, 'BALANCE_API_BASE_URL', '')
    if not api_key or not base_url or not user_id or amount <= 0:
        return None
    url = f"{base_url.rstrip('/')}/{user_id}/credit"
    headers = {'X-API-Key': api_key, 'Content-Type': 'application/json'}
    payload = {'amount': amount}
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=5)
        if response.status_code != 200:
            return None
        payload = response.json()
        return int(payload.get('balance', 0))
    except (requests.RequestException, ValueError, TypeError):
        return None


def notify_withdrawal(username: str, amount: int) -> None:
    api_key = getattr(settings, 'BALANCE_API_KEY', '')
    base_url = getattr(settings, 'NOTIFY_API_BASE_URL', '')
    if not api_key or not base_url or not username or amount <= 0:
        return None
    headers = {'X-API-Key': api_key, 'Content-Type': 'application/json'}
    payload = {'username': username, 'amount': amount}
    try:
        requests.post(base_url, json=payload, headers=headers, timeout=5)
    except requests.RequestException:
        return None


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
        if not stars_balance:
            stars_balance = serializer.validated_data.get('stars')
        try:
            stars_balance_value = int(stars_balance)
        except (TypeError, ValueError):
            stars_balance_value = 0
        if stars_balance_value and profile.telegram_stars_balance != stars_balance_value:
            profile.telegram_stars_balance = stars_balance_value
            updated_fields.append('telegram_stars_balance')
        if stars_balance_value and profile.stars_balance != stars_balance_value:
            profile.stars_balance = stars_balance_value
            updated_fields.append('stars_balance')
        if stars_balance_value and profile.stars_withdrawable != stars_balance_value:
            profile.stars_withdrawable = stars_balance_value
            updated_fields.append('stars_withdrawable')

        start_param = parsed_data.get('start_param') or parsed_data.get('start')
        if start_param and start_param.startswith('ref_') and not profile.referred_by:
            referral_code = start_param.replace('ref_', '', 1)
            with transaction.atomic():
                inviter_profile = (
                    UserProfile.objects.select_for_update()
                    .filter(referral_code=referral_code)
                    .first()
                )
                if inviter_profile and inviter_profile != profile:
                    profile.referred_by = inviter_profile
                    updated_fields.append('referred_by')
                    inviter_profile.referrals_count = models.F('referrals_count') + 1
                    settings_instance, _ = CardSettings.objects.get_or_create()
                    reward = settings_instance.referral_reward
                    if reward:
                        inviter_profile.stars_balance = models.F('stars_balance') + reward
                        inviter_profile.stars_withdrawable = models.F('stars_withdrawable') + reward
                        inviter_profile.save(
                            update_fields=['referrals_count', 'stars_balance', 'stars_withdrawable']
                        )
                    else:
                        inviter_profile.save(update_fields=['referrals_count'])
                    inviter_profile.refresh_from_db()

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
        if profile.telegram_id:
            external_balance = fetch_external_balance(profile.telegram_id)
            if external_balance is not None:
                needs_update = (
                    external_balance != profile.telegram_stars_balance
                    or external_balance != profile.stars_balance
                    or external_balance != profile.stars_withdrawable
                )
                if needs_update:
                    profile.telegram_stars_balance = external_balance
                    profile.stars_balance = external_balance
                    profile.stars_withdrawable = external_balance
                    profile.save(
                        update_fields=[
                            'telegram_stars_balance',
                            'stars_balance',
                            'stars_withdrawable',
                        ]
                    )
        elif profile.stars_withdrawable != profile.stars_balance:
            profile.stars_withdrawable = profile.stars_balance
            profile.save(update_fields=['stars_withdrawable'])
        data = UserProfileSerializer(profile).data
        data['referral_link'] = f"https://t.me/{settings.TELEGRAM_BOT_NAME}?start=ref_{profile.referral_code}"
        data['cards_opened'] = CollectionCard.objects.filter(user=request.user).count()
        data['cards_total'] = CardTemplate.objects.count()
        data['cards_groups'] = (
            CollectionCard.objects.filter(user=request.user)
            .values('template__group__name')
            .annotate(count=models.Sum('quantity'))
        )
        settings_instance = CardSettings.objects.first()
        data['card_open_price'] = settings_instance.open_price if settings_instance else 0
        return Response(data)


class CollectionView(APIView):
    def get(self, request, *args, **kwargs):
        cards = (
            CollectionCard.objects.filter(user=request.user)
            .select_related('template', 'template__group')
            .order_by('-template__rank', 'title')
        )
        group_totals = dict(
            CardTemplate.objects.values('group_id')
            .annotate(total=models.Count('id'))
            .values_list('group_id', 'total')
        )
        groups_payload = []
        for group in CardGroup.objects.all().prefetch_related('templates'):
            row_rewards = group.get_row_rewards()
            total_templates = group.rows_count * 3 if group.rows_count else 0
            if total_templates == 0:
                total_templates = len(row_rewards) * 3 if row_rewards else group.templates.count()
            templates = list(
                group.templates.order_by('-rank', 'id').values('id', 'rank')
            )
            groups_payload.append(
                {
                    'id': group.id,
                    'name': group.name,
                    'color': group.color,
                    'rating': group.rating,
                    'drop_chance': group.drop_chance,
                    'rows_count': group.rows_count,
                    'row_rewards': row_rewards,
                    'total_templates': total_templates,
                    'templates': templates,
                }
            )
        serializer = CardSerializer(
            cards,
            many=True,
            context={
                'request': request,
                'group_totals': group_totals,
            },
        )
        return Response({'cards': serializer.data, 'groups': groups_payload})

    def post(self, request, *args, **kwargs):
        groups = list(CardGroup.objects.all())
        if not groups:
            return Response({'detail': 'Группы карточек не настроены'}, status=status.HTTP_400_BAD_REQUEST)
        weighted_groups = [(group, max(group.drop_chance, 0.0)) for group in groups]
        non_zero = [(group, weight) for group, weight in weighted_groups if weight > 0]
        if non_zero:
            groups_pool, weights = zip(*non_zero)
        else:
            groups_pool, weights = groups, [1 for _ in groups]  # равные шансы, если веса не заданы
        selected_group = random.choices(groups_pool, weights=weights, k=1)[0]

        settings_instance = CardSettings.objects.first()
        if not settings_instance:
            settings_instance = CardSettings.objects.create()

        price = settings_instance.open_price
        profile_base = request.user.profile
        telegram_id = profile_base.telegram_id

        external_balance = None
        if price > 0:
            if not telegram_id:
                return Response(
                    {'detail': 'Не удалось подтвердить Telegram баланс пользователя'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            external_balance = debit_external_balance(telegram_id, price)
            if external_balance is None:
                return Response(
                    {'detail': 'Недостаточно звёзд на Telegram балансе'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        templates = list(selected_group.templates.all())
        if not templates:
            return Response({'detail': 'В выбранной группе нет карточек'}, status=status.HTTP_400_BAD_REQUEST)
        template = random.choice(templates)

        reward_amount = 0
        rows_completed = 0
        row_size = 3
        row_rewards = selected_group.get_row_rewards()
        total_rows = selected_group.rows_count or len(row_rewards)
        if total_rows <= 0:
            total_rows = (len(templates) + row_size - 1) // row_size

        with transaction.atomic():
            profile = UserProfile.objects.select_for_update().get(user=request.user)
            if profile.stars_balance < price:
                return Response(
                    {'detail': 'Недостаточно звёзд для открытия карточки'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            prev_unique = (
                CollectionCard.objects.select_for_update()
                .filter(user=request.user, template__group=selected_group)
                .values('template')
                .distinct()
                .count()
            )

            card, created = CollectionCard.objects.select_for_update().get_or_create(
                user=request.user,
                template=template,
                defaults={
                    'title': template.title,
                    'rarity': template.rarity,
                    'rank': template.rank,
                    'image': template.image,
                    'animation': template.animation,
                },
            )
            if not created:
                CollectionCard.objects.filter(pk=card.pk).update(
                    quantity=models.F('quantity') + 1
                )
                card.refresh_from_db()

            new_unique = (
                CollectionCard.objects.filter(user=request.user, template__group=selected_group)
                .values('template')
                .distinct()
                .count()
            )
            prev_rows = min(prev_unique // row_size, total_rows)
            new_rows = min(new_unique // row_size, total_rows)
            rows_completed = max(new_rows - prev_rows, 0)
            if rows_completed > 0:
                if row_rewards:
                    reward_amount = sum(row_rewards[prev_rows:new_rows])
                else:
                    reward_amount = 0

            profile.cards_opened = models.F('cards_opened') + 1
            if external_balance is not None:
                profile.stars_balance = external_balance
                profile.stars_withdrawable = external_balance
                update_fields = ['cards_opened', 'stars_balance', 'stars_withdrawable']
            else:
                profile.stars_balance = models.F('stars_balance') - price
                profile.stars_withdrawable = models.F('stars_balance') - price
                update_fields = ['cards_opened', 'stars_balance', 'stars_withdrawable']
            if external_balance is not None:
                profile.telegram_stars_balance = external_balance
                update_fields.append('telegram_stars_balance')
            profile.save(update_fields=update_fields)
            profile.refresh_from_db()

        if rows_completed > 0 and reward_amount > 0 and telegram_id:
            credit_external_balance(telegram_id, reward_amount)
            refreshed_balance = fetch_external_balance(telegram_id)
            if refreshed_balance is not None:
                UserProfile.objects.filter(user=request.user).update(
                    telegram_stars_balance=refreshed_balance,
                    stars_balance=refreshed_balance,
                    stars_withdrawable=refreshed_balance,
                )

        serializer = CardSerializer(card, context={'request': request})
        return Response(
            {
                'card': serializer.data,
                'group': selected_group.name,
                'price': price,
                'reward_earned': reward_amount,
            }
        )


class WithdrawView(APIView):
    def get(self, request, *args, **kwargs):
        withdraws = WithdrawRequest.objects.filter(user=request.user).order_by('-created_at')
        serializer = WithdrawRequestSerializer(withdraws, many=True)
        return Response({'history': serializer.data})

    def post(self, request, *args, **kwargs):
        serializer = WithdrawCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        notify_username = serializer.validated_data['recipient_username']
        notify_amount = serializer.validated_data['stars_amount']
        with transaction.atomic():
            profile = request.user.profile
            amount = serializer.validated_data['stars_amount']
            profile.stars_balance = models.F('stars_balance') - amount
            profile.stars_withdrawable = models.F('stars_withdrawable') - amount
            profile.save(update_fields=['stars_withdrawable', 'stars_balance'])
            profile.refresh_from_db()
            # не даём уйти в минус доступных к выводу
            if profile.stars_withdrawable < 0:
                profile.stars_withdrawable = 0
                profile.save(update_fields=['stars_withdrawable'])
            withdraw = WithdrawRequest.objects.create(
                user=request.user,
                stars_amount=amount,
                recipient_username=serializer.validated_data['recipient_username'],
            )
        notify_withdrawal(notify_username, notify_amount)
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
