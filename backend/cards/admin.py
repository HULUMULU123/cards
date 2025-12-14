from django.contrib import admin

from .models import CardGroup, CardSettings, CardTemplate, CollectionCard, UserProfile, WithdrawRequest

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


@admin.register(CollectionCard)
class CollectionCardAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'rarity', 'quantity')
    list_filter = ('rarity',)
    search_fields = ('title', 'user__username')
    fields = ('user', 'title', 'rarity', 'quantity', 'image', 'animation', 'template')


@admin.register(WithdrawRequest)
class WithdrawRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'recipient_username', 'stars_amount', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('user__username', 'recipient_username')


@admin.register(CardTemplate)
class CardTemplateAdmin(admin.ModelAdmin):
    list_display = [field.name for field in CardTemplate._meta.fields]
    list_filter = ('title',)
    search_fields = ('title',)


@admin.register(CardGroup)
class CardGroupAdmin(admin.ModelAdmin):
    list_display = [field.name for field in CardGroup._meta.fields]
    list_filter = ('name',)
    search_fields = ('name',)
    list_editable = ('drop_chance', 'color', 'rating', 'row_reward')


@admin.register(CardSettings)
class CardSettingsAdmin(admin.ModelAdmin):
    list_display = [field.name for field in CardSettings._meta.fields]
    list_editable = ('referral_reward', 'open_price')
