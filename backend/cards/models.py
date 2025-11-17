from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class UserProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='profile', verbose_name='Пользователь'
    )
    telegram_id = models.CharField(
        max_length=64, unique=True, blank=True, null=True, verbose_name='ID в Telegram'
    )
    stars_balance = models.PositiveIntegerField(default=0, verbose_name='Баланс звёзд')
    stars_withdrawable = models.PositiveIntegerField(
        default=0, verbose_name='Доступно для вывода'
    )
    referrals_count = models.PositiveIntegerField(default=0, verbose_name='Рефералы')
    cards_opened = models.PositiveIntegerField(default=0, verbose_name='Открыто карточек')

    class Meta:
        verbose_name = 'Профиль пользователя'
        verbose_name_plural = 'Профили пользователей'

    def __str__(self):
        return f"Profile({self.user.username})"


class Card(models.Model):
    RARITY_CHOICES = (
        ('common', 'Обычная'),
        ('rare', 'Редкая'),
        ('epic', 'Эпическая'),
        ('legendary', 'Легендарная'),
    )

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='cards', verbose_name='Пользователь'
    )
    title = models.CharField(max_length=255, verbose_name='Название')
    rarity = models.CharField(
        max_length=32, choices=RARITY_CHOICES, default='common', verbose_name='Редкость'
    )
    quantity = models.PositiveIntegerField(default=1, verbose_name='Количество')
    image = models.ImageField(upload_to='cards/', blank=True, null=True, verbose_name='Изображение')

    def __str__(self):
        return f"{self.title} x{self.quantity} ({self.user.username})"

    class Meta:
        verbose_name = 'Карточка'
        verbose_name_plural = 'Карточки'


class WithdrawRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'В обработке'),
        ('approved', 'Одобрено'),
        ('rejected', 'Отклонено'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='withdraw_requests',
        verbose_name='Пользователь',
    )
    stars_amount = models.PositiveIntegerField(verbose_name='Сумма звёзд')
    recipient_username = models.CharField(max_length=64, verbose_name='Получатель')
    status = models.CharField(
        max_length=16, choices=STATUS_CHOICES, default='pending', verbose_name='Статус'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')

    def __str__(self):
        return f"{self.user.username} -> {self.recipient_username} ({self.stars_amount})"

    class Meta:
        verbose_name = 'Запрос на вывод'
        verbose_name_plural = 'Запросы на вывод'
