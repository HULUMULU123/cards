from django.urls import path

from .views import (
    CollectionView,
    FreeOpenStatusView,
    ProfileView,
    StarsInvoiceView,
    TelegramAuthView,
    WithdrawView,
)

urlpatterns = [
    path('auth/telegram/', TelegramAuthView.as_view(), name='telegram-auth'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('internal/free-open/user/<str:telegram_id>/', FreeOpenStatusView.as_view(), name='free-open-status'),
    path('collection/', CollectionView.as_view(), name='collection'),
    path('withdraw/', WithdrawView.as_view(), name='withdraw'),
    path('stars/invoice/', StarsInvoiceView.as_view(), name='stars-invoice'),
]
