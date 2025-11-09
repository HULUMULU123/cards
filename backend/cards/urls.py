from django.urls import path

from .views import (
    CollectionView,
    ProfileView,
    StarsInvoiceView,
    TelegramAuthView,
    WithdrawView,
)

urlpatterns = [
    path('auth/telegram/', TelegramAuthView.as_view(), name='telegram-auth'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('collection/', CollectionView.as_view(), name='collection'),
    path('withdraw/', WithdrawView.as_view(), name='withdraw'),
    path('stars/invoice/', StarsInvoiceView.as_view(), name='stars-invoice'),
]
