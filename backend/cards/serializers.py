from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Card, UserProfile, WithdrawRequest

User = get_user_model()


class TelegramAuthSerializer(serializers.Serializer):
    init_data = serializers.CharField()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name')


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = UserProfile
        fields = (
            'user',
            'telegram_id',
            'stars_balance',
            'stars_withdrawable',
            'referrals_count',
            'cards_opened',
        )


class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ('id', 'title', 'rarity', 'quantity', 'image_url')


class WithdrawRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = WithdrawRequest
        fields = ('id', 'stars_amount', 'recipient_username', 'status', 'created_at')


class WithdrawCreateSerializer(serializers.Serializer):
    stars_amount = serializers.IntegerField(min_value=1)
    recipient_username = serializers.CharField(max_length=64)

    def validate(self, attrs):
        user = self.context['request'].user
        profile = user.profile
        amount = attrs['stars_amount']
        if amount > profile.stars_withdrawable:
            raise serializers.ValidationError('Недостаточно доступных звёзд для вывода')
        return attrs


class StarsInvoiceSerializer(serializers.Serializer):
    stars_amount = serializers.IntegerField(min_value=1)
