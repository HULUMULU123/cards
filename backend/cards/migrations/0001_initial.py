from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('telegram_id', models.CharField(blank=True, max_length=64, null=True, unique=True)),
                ('stars_balance', models.PositiveIntegerField(default=0)),
                ('stars_withdrawable', models.PositiveIntegerField(default=0)),
                ('referrals_count', models.PositiveIntegerField(default=0)),
                ('cards_opened', models.PositiveIntegerField(default=0)),
                ('user', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='profile',
                    to=settings.AUTH_USER_MODEL
                )),
            ],
        ),
        migrations.CreateModel(
            name='WithdrawRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('stars_amount', models.PositiveIntegerField()),
                ('recipient_username', models.CharField(max_length=64)),
                ('status', models.CharField(
                    choices=[
                        ('pending', 'В обработке'),
                        ('approved', 'Одобрено'),
                        ('rejected', 'Отклонено')
                    ],
                    default='pending',
                    max_length=16
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='withdraw_requests',
                    to=settings.AUTH_USER_MODEL
                )),
            ],
        ),
        migrations.CreateModel(
            name='Card',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('rarity', models.CharField(
                    choices=[
                        ('common', 'Обычная'),
                        ('rare', 'Редкая'),
                        ('epic', 'Эпическая'),
                        ('legendary', 'Легендарная')
                    ],
                    default='common',
                    max_length=32
                )),
                ('quantity', models.PositiveIntegerField(default=1)),
                ('image_url', models.URLField(blank=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='cards',
                    to=settings.AUTH_USER_MODEL
                )),
            ],
        ),
    ]
