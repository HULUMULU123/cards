from django.contrib import admin
from django import forms
from django.core.exceptions import ValidationError

from .models import (
    CardGroup,
    CardGroupRow,
    CardSettings,
    CardTemplate,
    CollectionCard,
    UserProfile,
    WithdrawRequest,
)

admin.site.site_header = 'Администрирование карточек'
admin.site.site_title = 'Админка карточек'
admin.site.index_title = 'Управление мини-приложением'


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'telegram_id',
        'stars_balance',
        'stars_withdrawable',
        'referrals_count',
    )
    search_fields = ('user__username', 'telegram_id')


class CollectionCardAdminForm(forms.ModelForm):
    class Meta:
        model = CollectionCard
        fields = ('user', 'template', 'quantity')

    def clean(self):
        cleaned = super().clean()
        template = cleaned.get('template')
        if not template:
            raise ValidationError('Выберите карточку')
        self.instance.title = template.title
        self.instance.rarity = template.rarity
        self.instance.rank = template.rank
        self.instance.image = template.image
        self.instance.animation = template.animation
        return cleaned


@admin.register(CollectionCard)
class CollectionCardAdmin(admin.ModelAdmin):
    form = CollectionCardAdminForm
    list_display = ('user', 'title', 'rank', 'quantity')
    search_fields = ('title', 'user__username')
    fields = ('user', 'template', 'quantity')
    autocomplete_fields = ('user', 'template')


class CardGroupRowInline(admin.TabularInline):
    model = CardGroupRow
    extra = 0
    fields = ('index', 'reward')
    ordering = ('index',)


@admin.register(WithdrawRequest)
class WithdrawRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'recipient_username', 'stars_amount', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('user__username', 'recipient_username')


@admin.register(CardTemplate)
class CardTemplateAdmin(admin.ModelAdmin):
    list_display = ('title', 'rank', 'row_index', 'group')
    list_filter = ('group',)
    search_fields = ('title',)
    fields = ('title', 'rank', 'row_index', 'group', 'image', 'animation')


@admin.register(CardGroup)
class CardGroupAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'drop_chance',
        'color',
        'rating',
        'rows_count',
        'row_reward_min',
        'row_reward_max',
    )
    list_filter = ('name',)
    search_fields = ('name',)
    list_editable = (
        'drop_chance',
        'color',
        'rating',
        'rows_count',
        'row_reward_min',
        'row_reward_max',
    )
    inlines = [CardGroupRowInline]


@admin.register(CardSettings)
class CardSettingsAdmin(admin.ModelAdmin):
    list_display = [field.name for field in CardSettings._meta.fields]
    list_editable = ('referral_reward', 'open_price')
