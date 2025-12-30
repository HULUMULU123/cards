from django.db import migrations, models
import django.db.models.deletion


def sync_collection_card_ranks(apps, schema_editor):
    CollectionCard = apps.get_model('cards', 'CollectionCard')
    for card in CollectionCard.objects.select_related('template').all():
        if card.template_id:
            CollectionCard.objects.filter(pk=card.pk).update(rank=card.template.rank)


class Migration(migrations.Migration):
    dependencies = [
        ('cards', '0009_cardgroup_color_cardgroup_rating_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='cardgroup',
            name='rows_count',
            field=models.PositiveIntegerField(default=0, verbose_name='Количество рядов'),
        ),
        migrations.CreateModel(
            name='CardGroupRow',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('index', models.PositiveIntegerField(verbose_name='Номер ряда')),
                ('reward', models.PositiveIntegerField(default=0, verbose_name='Награда за ряд')),
                (
                    'group',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='rows',
                        to='cards.cardgroup',
                        verbose_name='Группа',
                    ),
                ),
            ],
            options={
                'verbose_name': 'Ряд группы',
                'verbose_name_plural': 'Ряды групп',
                'ordering': ('index',),
            },
        ),
        migrations.AddConstraint(
            model_name='cardgrouprow',
            constraint=models.UniqueConstraint(fields=('group', 'index'), name='unique_group_row_index'),
        ),
        migrations.AddField(
            model_name='cardtemplate',
            name='rank',
            field=models.FloatField(default=1.0, verbose_name='Ранг'),
        ),
        migrations.AddField(
            model_name='collectioncard',
            name='rank',
            field=models.FloatField(default=1.0, verbose_name='Ранг'),
        ),
        migrations.RunPython(sync_collection_card_ranks, migrations.RunPython.noop),
    ]
