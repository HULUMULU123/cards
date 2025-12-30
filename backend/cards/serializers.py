from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import CardTemplate, CollectionCard, UserProfile, WithdrawRequest

User = get_user_model()


class TelegramAuthSerializer(serializers.Serializer):
    init_data = serializers.CharField()
    stars = serializers.IntegerField(required=False, allow_null=True)


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
    rank = serializers.SerializerMethodField()

    class Meta:
        model = CollectionCard
        fields = (
            'id',
            'title',
            'rarity',
            'rank',
            'quantity',
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
        if not obj.template or not obj.template.group:
            return None
        group = obj.template.group
        group_totals = self.context.get('group_totals') or {}
        group_rows = self.context.get('group_rows') or {}
        row_rewards = group_rows.get(group.id)
        total_templates = group_totals.get(group.id)
        if group.rows_count:
            total_templates = group.rows_count * 3
        elif total_templates is None:
            total_templates = group.templates.count()
        if row_rewards is None:
            row_rewards = list(group.rows.order_by('index').values_list('reward', flat=True))
        return {
            'name': group.name,
            'color': group.color,
            'rating': group.rating,
            'drop_chance': group.drop_chance,
            'row_reward': group.row_reward,
            'rows_count': group.rows_count,
            'row_rewards': row_rewards,
            'total_templates': total_templates,
        }

    def get_rank(self, obj):
        if obj.template and obj.template.rank is not None:
            return obj.template.rank
        return obj.rank


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
        available = profile.stars_balance
        if amount > available:
            raise serializers.ValidationError('Недостаточно звёзд для вывода')
        return attrs


class StarsInvoiceSerializer(serializers.Serializer):
    stars_amount = serializers.IntegerField(min_value=1)
