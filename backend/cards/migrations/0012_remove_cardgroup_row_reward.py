from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('cards', '0011_cardgroup_row_reward_bounds'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='cardgroup',
            name='row_reward',
        ),
    ]
