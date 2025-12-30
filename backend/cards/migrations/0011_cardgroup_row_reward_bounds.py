from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('cards', '0010_cardgroup_rows_and_ranks'),
    ]

    operations = [
        migrations.AddField(
            model_name='cardgroup',
            name='row_reward_min',
            field=models.PositiveIntegerField(
                blank=True, null=True, verbose_name='Минимальная награда за ряд'
            ),
        ),
        migrations.AddField(
            model_name='cardgroup',
            name='row_reward_max',
            field=models.PositiveIntegerField(
                blank=True, null=True, verbose_name='Максимальная награда за ряд'
            ),
        ),
    ]
