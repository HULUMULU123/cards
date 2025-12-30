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
    color = models.CharField(
        max_length=16, default='#000000', verbose_name='Цвет группы (hex)'
    )
    rating = models.FloatField(
        default=1.0, help_text='Рейтинг группы (0.5 - 10)', verbose_name='Рейтинг'
    )
    rows_count = models.PositiveIntegerField(default=0, verbose_name='Количество рядов')
    row_reward_min = models.PositiveIntegerField(
        blank=True, null=True, verbose_name='Минимальная награда за ряд'
    )
    row_reward_max = models.PositiveIntegerField(
        blank=True, null=True, verbose_name='Максимальная награда за ряд'
    )
    row_reward = models.PositiveIntegerField(
        default=0, verbose_name='Награда за собранный ряд'
    )

    class Meta:
        verbose_name = 'Группа карточек'
        verbose_name_plural = 'Группы карточек'

    def __str__(self):
        return f"{self.name} ({self.drop_chance})"

    def get_row_rewards(self):
        if self.rows_count and self.rows_count > 0:
            if self.row_reward_min is not None or self.row_reward_max is not None:
                min_reward = self.row_reward_min or 0
                max_reward = (
                    self.row_reward_max if self.row_reward_max is not None else min_reward
                )
                if self.rows_count == 1:
                    return [max_reward]
                step = (max_reward - min_reward) / (self.rows_count - 1)
                return [int(round(min_reward + step * index)) for index in range(self.rows_count)]
        row_rewards = list(self.rows.order_by('index').values_list('reward', flat=True))
        return row_rewards


class CardGroupRow(models.Model):
    group = models.ForeignKey(
        CardGroup,
        on_delete=models.CASCADE,
        related_name='rows',
        verbose_name='Группа',
    )
    index = models.PositiveIntegerField(verbose_name='Номер ряда')
    reward = models.PositiveIntegerField(default=0, verbose_name='Награда за ряд')

    class Meta:
        verbose_name = 'Ряд группы'
        verbose_name_plural = 'Ряды групп'
        ordering = ('index',)
        constraints = [
            models.UniqueConstraint(fields=['group', 'index'], name='unique_group_row_index')
        ]

    def __str__(self):
        return f"{self.group.name} - ряд {self.index}"


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
    rank = models.FloatField(default=1.0, verbose_name='Ранг')
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


class CardSettings(models.Model):
    open_price = models.PositiveIntegerField(
        default=0, verbose_name='Стоимость открытия карточки в звёздах'
    )
    referral_reward = models.PositiveIntegerField(
        default=0, verbose_name='Награда за привлечённого пользователя (звёзды)'
    )

    class Meta:
        verbose_name = 'Настройки карточек'
        verbose_name_plural = 'Настройки карточек'

    def __str__(self):
        return f"Стоимость открытия: {self.open_price}"


class CollectionCard(models.Model):
    RARITY_CHOICES = (
        ('common', 'Обычная'),
        ('rare', 'Редкая'),
        ('epic', 'Эпическая'),
        ('legendary', 'Легендарная'),
    )

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='collection', verbose_name='Пользователь'
    )
    title = models.CharField(max_length=255, verbose_name='Название')
    rarity = models.CharField(
        max_length=32, choices=RARITY_CHOICES, default='common', verbose_name='Редкость'
    )
    rank = models.FloatField(default=1.0, verbose_name='Ранг')
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
        related_name='collection_cards',
        verbose_name='Шаблон карточки',
    )
    quantity = models.PositiveIntegerField(default=1, verbose_name='Количество')

    def __str__(self):
        return f"{self.title} ({self.user.username})"

    class Meta:
        db_table = 'collection'
        verbose_name = 'Коллекция'
        verbose_name_plural = 'Коллекции'
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'template'], name='unique_user_card_template'
            )
        ]


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
