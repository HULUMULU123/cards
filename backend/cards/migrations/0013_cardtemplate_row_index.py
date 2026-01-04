from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('cards', '0012_remove_cardgroup_row_reward'),
    ]

    operations = [
        migrations.AddField(
            model_name='cardtemplate',
            name='row_index',
            field=models.PositiveIntegerField(default=1, verbose_name='Ряд'),
        ),
    ]
