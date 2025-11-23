from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0005_collectioncard_delete_card_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='CardSettings',
            fields=[
                (
                    'id',
                    models.BigAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name='ID'
                    ),
                ),
                (
                    'open_price',
                    models.PositiveIntegerField(
                        default=0, verbose_name='Стоимость открытия карточки в звёздах'
                    ),
                ),
            ],
            options={
                'verbose_name': 'Настройки карточек',
                'verbose_name_plural': 'Настройки карточек',
            },
        ),
    ]
