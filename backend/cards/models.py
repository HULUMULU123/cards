from django.contrib.auth import get_user_model
from django.db import models
from django.utils.crypto import get_random_string

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
    telegram_stars_balance = models.PositiveIntegerField(
        default=0, verbose_name='Баланс звёзд в Telegram'
    )
    referral_code = models.CharField(
        max_length=12, unique=True, default='', verbose_name='Реферальный код'
    )
    referred_by = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='referrals',
        verbose_name='Пригласивший пользователь',
    )
    referrals_count = models.PositiveIntegerField(default=0, verbose_name='Рефералы')
    cards_opened = models.PositiveIntegerField(default=0, verbose_name='Открыто карточек')

    class Meta:
        verbose_name = 'Профиль пользователя'
        verbose_name_plural = 'Профили пользователей'

    def __str__(self):
        return f"Profile({self.user.username})"

    def save(self, *args, **kwargs):
        if not self.referral_code:
            self.referral_code = get_random_string(10)
        super().save(*args, **kwargs)


class CardGroup(models.Model):
    name = models.CharField(max_length=128, verbose_name='Название группы')
    drop_chance = models.FloatField(
        default=0.0, help_text='Шанс выпадения (0-1)', verbose_name='Шанс выпадения'
    )

    class Meta:
        verbose_name = 'Группа карточек'
        verbose_name_plural = 'Группы карточек'

    def __str__(self):
        return f"{self.name} ({self.drop_chance})"


class CardTemplate(models.Model):
    title = models.CharField(max_length=255, verbose_name='Название')
    rarity = models.CharField(
        max_length=32,
        choices=(
            ('common', 'Обычная'),
            ('rare', 'Редкая'),
            ('epic', 'Эпическая'),
            ('legendary', 'Легендарная'),
        ),
        default='common',
        verbose_name='Редкость',
    )
    group = models.ForeignKey(
        CardGroup,
        on_delete=models.CASCADE,
        related_name='templates',
        verbose_name='Группа',
    )
    image = models.ImageField(upload_to='cards/', blank=True, null=True, verbose_name='Изображение')
    animation = models.FileField(
        upload_to='cards/animations/',
        blank=True,
        null=True,
        verbose_name='JSON-анимация появления',
    )

    class Meta:
        verbose_name = 'Шаблон карточки'
        verbose_name_plural = 'Шаблоны карточек'

    def __str__(self):
        return self.title


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
    animation = models.FileField(
        upload_to='cards/animations/',
        blank=True,
        null=True,
        verbose_name='JSON-анимация появления',
    )
    template = models.ForeignKey(
        CardTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='instances',
        verbose_name='Шаблон карточки',
    )

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
