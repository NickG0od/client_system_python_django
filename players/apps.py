from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class PlayersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'players'
    verbose_name = _('Players')
