from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import CardTemplate, CollectionCard, UserProfile, WithdrawRequest

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
            'telegram_stars_balance',
            'stars_balance',
            'stars_withdrawable',
            'referrals_count',
            'cards_opened',
            'referral_code',
        )


class CardSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    animation_url = serializers.SerializerMethodField()
    group = serializers.SerializerMethodField()

    class Meta:
        model = CollectionCard
        fields = (
            'id',
            'title',
            'rarity',
            'image_url',
            'animation_url',
            'group',
        )

    def get_image_url(self, obj):
        if not obj.image:
            return None
        request = self.context.get('request')
        url = obj.image.url
        if request:
            return request.build_absolute_uri(url)
        return url

    def get_animation_url(self, obj):
        if not obj.animation:
            return None
        request = self.context.get('request')
        url = obj.animation.url
        if request:
            return request.build_absolute_uri(url)
        return url

    def get_group(self, obj):
        return obj.template.group.name if obj.template and obj.template.group else None


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
