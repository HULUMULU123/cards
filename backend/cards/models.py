from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    telegram_id = models.CharField(max_length=64, unique=True, blank=True, null=True)
    stars_balance = models.PositiveIntegerField(default=0)
    stars_withdrawable = models.PositiveIntegerField(default=0)
    referrals_count = models.PositiveIntegerField(default=0)
    cards_opened = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Profile({self.user.username})"


class Card(models.Model):
    RARITY_CHOICES = (
        ('common', 'Обычная'),
        ('rare', 'Редкая'),
        ('epic', 'Эпическая'),
        ('legendary', 'Легендарная'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cards')
    title = models.CharField(max_length=255)
    rarity = models.CharField(max_length=32, choices=RARITY_CHOICES, default='common')
    quantity = models.PositiveIntegerField(default=1)
    image_url = models.URLField(blank=True)

    def __str__(self):
        return f"{self.title} x{self.quantity} ({self.user.username})"


class WithdrawRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'В обработке'),
        ('approved', 'Одобрено'),
        ('rejected', 'Отклонено'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='withdraw_requests')
    stars_amount = models.PositiveIntegerField()
    recipient_username = models.CharField(max_length=64)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} -> {self.recipient_username} ({self.stars_amount})"
