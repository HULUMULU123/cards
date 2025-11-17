import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('cards', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='card',
            name='image_url',
        ),
        migrations.AddField(
            model_name='card',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='cards/', verbose_name='Изображение'),
        ),
        migrations.AlterField(
            model_name='card',
            name='quantity',
            field=models.PositiveIntegerField(default=1, verbose_name='Количество'),
        ),
        migrations.AlterField(
            model_name='card',
            name='rarity',
            field=models.CharField(
                choices=[('common', 'Обычная'), ('rare', 'Редкая'), ('epic', 'Эпическая'), ('legendary', 'Легендарная')],
                default='common',
                max_length=32,
                verbose_name='Редкость',
            ),
        ),
        migrations.AlterField(
            model_name='card',
            name='title',
            field=models.CharField(max_length=255, verbose_name='Название'),
        ),
        migrations.AlterField(
            model_name='card',
            name='user',
            field=models.ForeignKey(
                on_delete=models.deletion.CASCADE,
                related_name='cards',
                to='auth.user',
                verbose_name='Пользователь',
            ),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='cards_opened',
            field=models.PositiveIntegerField(default=0, verbose_name='Открыто карточек'),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='referrals_count',
            field=models.PositiveIntegerField(default=0, verbose_name='Рефералы'),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='stars_balance',
            field=models.PositiveIntegerField(default=0, verbose_name='Баланс звёзд'),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='stars_withdrawable',
            field=models.PositiveIntegerField(default=0, verbose_name='Доступно для вывода'),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='telegram_id',
            field=models.CharField(blank=True, max_length=64, null=True, unique=True, verbose_name='ID в Telegram'),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='user',
            field=models.OneToOneField(
                on_delete=models.deletion.CASCADE,
                related_name='profile',
                to='auth.user',
                verbose_name='Пользователь',
            ),
        ),
        migrations.AlterField(
            model_name='withdrawrequest',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, verbose_name='Создано'),
        ),
        migrations.AlterField(
            model_name='withdrawrequest',
            name='recipient_username',
            field=models.CharField(max_length=64, verbose_name='Получатель'),
        ),
        migrations.AlterField(
            model_name='withdrawrequest',
            name='stars_amount',
            field=models.PositiveIntegerField(verbose_name='Сумма звёзд'),
        ),
        migrations.AlterField(
            model_name='withdrawrequest',
            name='status',
            field=models.CharField(
                choices=[('pending', 'В обработке'), ('approved', 'Одобрено'), ('rejected', 'Отклонено')],
                default='pending',
                max_length=16,
                verbose_name='Статус',
            ),
        ),
        migrations.AlterField(
            model_name='withdrawrequest',
            name='user',
            field=models.ForeignKey(
                on_delete=models.deletion.CASCADE,
                related_name='withdraw_requests',
                to='auth.user',
                verbose_name='Пользователь',
            ),
        ),
    ]
