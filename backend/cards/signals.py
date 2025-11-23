from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import CollectionCard, UserProfile

User = get_user_model()


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(
            user=instance,
            stars_balance=417,
            stars_withdrawable=300,
            referrals_count=38,
            cards_opened=417,
        )
        # добавить стартовую коллекцию для демонстрации
        CollectionCard.objects.create(
            user=instance,
            title='Ice Watch',
            rarity='epic',
        )
        CollectionCard.objects.create(
            user=instance,
            title='City Lights',
            rarity='rare',
        )
