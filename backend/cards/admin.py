from django.contrib import admin

from .models import Card, UserProfile, WithdrawRequest

admin.site.site_header = 'Администрирование карточек'
admin.site.site_title = 'Админка карточек'
admin.site.index_title = 'Управление мини-приложением'


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'telegram_id', 'stars_balance', 'stars_withdrawable', 'referrals_count')
    search_fields = ('user__username', 'telegram_id')


@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'rarity', 'quantity')
    list_filter = ('rarity',)
    search_fields = ('title', 'user__username')
    fields = ('user', 'title', 'rarity', 'quantity', 'image')


@admin.register(WithdrawRequest)
class WithdrawRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'recipient_username', 'stars_amount', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('user__username', 'recipient_username')
