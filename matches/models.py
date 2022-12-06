from datetime import timedelta
from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.utils.translation import gettext_lazy as _
from django.utils.translation import pgettext_lazy as _p
from events.models import UserEvent, ClubEvent, EventVideoLink
from references.models import UserTeam, ClubTeam, PlayerProtocolStatus
from users.models import User
from video.models import Video
from players.models import UserPlayer, ClubPlayer



class AbstractMatch(models.Model):
    trainer_user_id = models.ForeignKey(
        User,
        verbose_name=_('trainer'),
        help_text=_('Coach tied to the match'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    duration = models.DurationField(
        verbose_name=_('duration match'),
        help_text=_('The duration of the match in the format 00:00:00'),
        null=False,
        default=timedelta(seconds=0),
    )
    goals = models.SmallIntegerField(
        verbose_name=_('goals'),
        help_text=_('Number of goals scored by the team.'),
        default=0
    )
    penalty = models.SmallIntegerField(
        verbose_name=_('penalty'),
        help_text=_('Number of team penalties per match.'),
        default=0
    )
    opponent = models.CharField(
        max_length=255,
        default=""
    )
    o_goals = models.SmallIntegerField(
        verbose_name=_('opponent goals'),
        help_text=_('Number of goals scored by the opponent team.'),
        default=0
    )
    o_penalty = models.SmallIntegerField(
        verbose_name=_('opponent penalty'),
        help_text=_('Number of opponent team penalties per match.'),
        default=0
    )
    estimation = models.SmallIntegerField(
        verbose_name=_('estimation'),
        help_text=_('Rating of the match on the scale.'),
        default=0
    )
    place = models.CharField(
        max_length=80,
        verbose_name=_('place'),
        help_text=_('Venue of the match.'),
        null=True,
        blank=True,
    )
    tournament = models.CharField(
        max_length=80,
        verbose_name=_('tournament'),
        help_text=_('Tournament name.'),
        null=True,
        blank=True,
    )
    m_type = models.IntegerField(
        help_text=_('Match type, 0 - not official, 1 - official.'),
        default=0,
        validators=[MaxValueValidator(1), MinValueValidator(0)]
    )
    m_format = models.CharField(
        max_length=80,
        help_text=_('Match format.'),
        null=True,
        blank=True,
    )
    video_id = models.ForeignKey(
        Video,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    scheme_data = models.JSONField(
        null=True,
        blank=True,
    )

    objects = models.Manager()
    class Meta:
        abstract = True


class UserMatch(AbstractMatch):
    event_id = models.OneToOneField(
        UserEvent,
        on_delete=models.CASCADE,
        primary_key=True
    )
    sync_event = models.ForeignKey(UserEvent, on_delete=models.SET_NULL, null=True, blank=True, related_name="sync_event")
    team_id = models.ForeignKey(
        UserTeam,
        on_delete=models.CASCADE
    )
    class Meta:
        abstract = False
        ordering = ['-event_id__date']
        permissions = [
            (
                "analytics_usermatch",
                _('Access to the section "Analytics" for UserMatch')
            )
        ]


class ClubMatch(AbstractMatch):
    event_id = models.OneToOneField(
        ClubEvent,
        on_delete=models.CASCADE,
        primary_key=True
    )
    sync_event = models.ForeignKey(ClubEvent, on_delete=models.SET_NULL, null=True, blank=True, related_name="sync_event")
    team_id = models.ForeignKey(
        ClubTeam,
        on_delete=models.CASCADE,
    )
    class Meta:
        abstract = False
        ordering = ['-event_id__date']
        permissions = [
            (
                "analytics_clubmatch",
                _('Access to the section "Analytics" for ClubMatch')
            )
        ]


class AbstractProtocol(models.Model):
    order = models.IntegerField(default=0)
    is_opponent = models.BooleanField(default=False)
    p_num = models.SmallIntegerField(null=True, blank=True)
    minute_from = models.SmallIntegerField(null=True, blank=True)
    minute_to = models.SmallIntegerField(null=True, blank=True)
    goal = models.SmallIntegerField(null=True, blank=True)
    penalty = models.SmallIntegerField(null=True, blank=True)
    p_pass = models.SmallIntegerField(null=True, blank=True)
    yellow_card = models.SmallIntegerField(null=True, blank=True)
    red_card = models.SmallIntegerField(null=True, blank=True)
    estimation = models.SmallIntegerField(null=True, blank=True)
    like = models.BooleanField(default=False)
    dislike = models.BooleanField(default=False)
    p_status = models.ForeignKey(PlayerProtocolStatus, on_delete=models.SET_NULL, null=True, blank=True)
    is_captain = models.BooleanField(default=False)
    is_goalkeeper = models.BooleanField(default=False)
    border_red = models.SmallIntegerField(default=0)
    border_black = models.SmallIntegerField(default=0)
    
    video_link = models.ForeignKey(EventVideoLink, on_delete=models.SET_NULL, null=True, blank=True)

    objects = models.Manager()
    class Meta:
        abstract = True


class UserProtocol(AbstractProtocol):
    match = models.ForeignKey(UserMatch, on_delete=models.CASCADE)
    player = models.ForeignKey(UserPlayer, on_delete=models.CASCADE)
    class Meta:
        abstract = False
        ordering = ['p_status__order', 'order', 'player__surname', 'player__name']


class ClubProtocol(AbstractProtocol):
    match = models.ForeignKey(ClubMatch, on_delete=models.CASCADE)
    player = models.ForeignKey(ClubPlayer, on_delete=models.CASCADE)
    class Meta:
        abstract = False
        ordering = ['order', 'player__surname', 'player__name']

