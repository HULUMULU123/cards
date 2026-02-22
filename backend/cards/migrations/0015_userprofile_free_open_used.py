from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0014_alter_cardtemplate_options'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='free_open_used',
            field=models.BooleanField(default=False, verbose_name='Бесплатное открытие использовано'),
        ),
    ]

