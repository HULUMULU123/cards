import hashlib
import hmac
import json
from typing import Optional
from urllib.parse import parse_qsl

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Card, UserProfile, WithdrawRequest
from .serializers import (
    CardSerializer,
    StarsInvoiceSerializer,
    TelegramAuthSerializer,
    UserProfileSerializer,
    WithdrawCreateSerializer,
    WithdrawRequestSerializer,
)

User = get_user_model()


def verify_telegram_init_data(init_data: str) -> Optional[dict]:
    if not init_data:
        return None
    data = dict(parse_qsl(init_data, keep_blank_values=True))
    incoming_hash = data.pop('hash', None)
    if not incoming_hash:
        return None
    data_check_string = '\n'.join(f"{k}={v}" for k, v in sorted(data.items()))
    secret_key = hashlib.sha256(settings.TELEGRAM_BOT_TOKEN.encode()).digest()
    calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(calculated_hash, incoming_hash):
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
        if profile.telegram_id != str(user_payload['id']):
            profile.telegram_id = str(user_payload['id'])
            profile.save(update_fields=['telegram_id'])

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
        data['referral_link'] = f"https://t.me/{request.user.username}?start=ref"
        data['cards_total'] = Card.objects.filter(user=request.user).count()
        return Response(data)


class CollectionView(APIView):
    def get(self, request, *args, **kwargs):
        cards = Card.objects.filter(user=request.user).order_by('title')
        serializer = CardSerializer(cards, many=True)
        return Response({'cards': serializer.data})


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
