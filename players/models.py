from statistics import mode
from django.db import models
from users.models import User
from clubs.models import Club
from references.models import UserTeam, ClubTeam
from references.models import PlayerTeamStatus, PlayerPlayerStatus, PlayerLevel, PlayerPosition, PlayerFoot



class PlayerCard(models.Model):
    citizenship = models.CharField(max_length=30, null=True, blank=True)
    club_from = models.CharField(max_length=30, null=True, blank=True)
    growth = models.IntegerField(null=True, blank=True)
    weight = models.IntegerField(null=True, blank=True)
    game_num = models.IntegerField(null=True, blank=True)
    birthsday = models.DateField(null=True, blank=True)
    ref_team_status = models.ForeignKey(PlayerTeamStatus, on_delete=models.CASCADE, null=True, blank=True)
    ref_player_status = models.ForeignKey(PlayerPlayerStatus, on_delete=models.CASCADE, null=True, blank=True)
    ref_level = models.ForeignKey(PlayerLevel, on_delete=models.CASCADE, null=True, blank=True)
    ref_position = models.ForeignKey(PlayerPosition, on_delete=models.CASCADE, null=True, blank=True)
    ref_foot = models.ForeignKey(PlayerFoot, on_delete=models.CASCADE, null=True, blank=True)
    come = models.DateField(null=True, blank=True)
    leave = models.DateField(null=True, blank=True)
    contacts = models.JSONField(null=True, blank=True)
    notes = models.JSONField(null=True, blank=True)

    objects = models.Manager()


class AbstractPlayer(models.Model):
    date_creation = models.DateField(auto_now_add=True)
    surname = models.CharField(max_length=30)
    name = models.CharField(max_length=30)
    patronymic = models.CharField(max_length=30, null=True, blank=True)

    photo = models.ImageField(upload_to='players/img/uploads', null=True, blank=True)
    card = models.ForeignKey(PlayerCard, on_delete=models.CASCADE, null=True, blank=True)

    objects = models.Manager()

    def get_full_name(self):
        return f"{self.surname} {self.name} {self.patronymic}"

    def get_part_name(self):
        return f"{self.surname} {self.name}"

    class Meta():
        abstract = True
        ordering = ['surname', 'name', 'patronymic']

    def __str__(self):
        return f"[id: {self.id}] {self.surname} {self.name} {self.patronymic}"


class UserPlayer(AbstractPlayer):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(UserTeam, on_delete=models.CASCADE)
    class Meta(AbstractPlayer.Meta):
        abstract = False


class ClubPlayer(AbstractPlayer):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(ClubTeam, on_delete=models.CASCADE)
    class Meta(AbstractPlayer.Meta):
        abstract = False


class CardSection(models.Model):
    title = models.JSONField(null=True, blank=True)
    text_id = models.CharField(max_length=20, null=True, blank=True)
    parent = models.IntegerField(
        help_text='Ид раздела родителя',
        null=True,
        blank=True
    )
    visible = models.BooleanField(
        help_text='Показывать раздел пользователю или нет',
        default=True
    )
    short_name = models.CharField(
        max_length=10,
        help_text='Короткий ключ для поиска',
        null=True,
        blank=True
    )
    order = models.IntegerField(
        help_text='Индекс сортировки',
        default=0
    )
    objects = models.Manager()
    class Meta:
        ordering = ['order']


class CardSectionUser(models.Model):
    section = models.ForeignKey(CardSection, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(UserTeam, on_delete=models.CASCADE)


class CardSectionClub(models.Model):
    section = models.ForeignKey(CardSection, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(ClubTeam, on_delete=models.CASCADE)


class PlayersTableColumns(models.Model):
    title = models.JSONField(null=True, blank=True)
    text_id = models.CharField(max_length=20, null=True, blank=True)
    parent = models.IntegerField(
        help_text='Ид раздела родителя',
        null=True,
        blank=True
    )
    visible = models.BooleanField(
        help_text='Показывать раздел пользователю или нет',
        default=True
    )
    short_name = models.CharField(
        max_length=10,
        help_text='Короткий ключ для поиска',
        null=True,
        blank=True
    )
    order = models.IntegerField(
        help_text='Индекс сортировки',
        default=0
    )
    objects = models.Manager()
    class Meta:
        ordering = ['order']


class PlayerCharacteristicsRows(models.Model):
    title = models.JSONField(null=True, blank=True)
    is_nfb = models.BooleanField(
        help_text='NFB шаблон для примера',
        default=False
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    club = models.ForeignKey(Club, on_delete=models.CASCADE, null=True, blank=True)
    parent = models.IntegerField(
        help_text='Ид раздела родителя',
        null=True,
        blank=True
    )
    visible = models.BooleanField(
        help_text='Показывать раздел пользователю или нет',
        default=True
    )
    short_name = models.CharField(
        max_length=10,
        help_text='Короткий ключ для поиска',
        null=True,
        blank=True
    )
    order = models.IntegerField(
        help_text='Индекс сортировки',
        default=0
    )
    objects = models.Manager()
    class Meta:
        ordering = ['order']


class PlayerCharacteristicUser(models.Model):
    characteristics = models.ForeignKey(PlayerCharacteristicsRows, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    player = models.ForeignKey(UserPlayer, on_delete=models.CASCADE)
    date_creation = models.DateField(auto_now_add=True)
    value = models.IntegerField(default=0)
    notes = models.CharField(null=True, blank=True, max_length=255)


class PlayerCharacteristicClub(models.Model):
    characteristics = models.ForeignKey(PlayerCharacteristicsRows, on_delete=models.CASCADE)
    club = models.ForeignKey(Club, on_delete=models.CASCADE, null=True, blank=True)
    player = models.ForeignKey(ClubPlayer, on_delete=models.CASCADE)
    date_creation = models.DateField(auto_now_add=True)
    value = models.IntegerField(default=0)
    notes = models.CharField(null=True, blank=True, max_length=255)



class PlayerQuestionnairesRows(models.Model):
    title = models.JSONField(null=True, blank=True)
    is_nfb = models.BooleanField(
        help_text='NFB шаблон для примера',
        default=False
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    club = models.ForeignKey(Club, on_delete=models.CASCADE, null=True, blank=True)
    parent = models.IntegerField(
        help_text='Ид раздела родителя',
        null=True,
        blank=True
    )
    visible = models.BooleanField(
        help_text='Показывать раздел пользователю или нет',
        default=True
    )
    short_name = models.CharField(
        max_length=10,
        help_text='Короткий ключ для поиска',
        null=True,
        blank=True
    )
    order = models.IntegerField(
        help_text='Индекс сортировки',
        default=0
    )
    objects = models.Manager()
    class Meta:
        ordering = ['order']


class PlayerQuestionnaireUser(models.Model):
    questionnaire = models.ForeignKey(PlayerQuestionnairesRows, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    player = models.ForeignKey(UserPlayer, on_delete=models.CASCADE)
    notes = models.CharField(null=True, blank=True, max_length=255)


class PlayerQuestionnaireClub(models.Model):
    questionnaire = models.ForeignKey(PlayerQuestionnairesRows, on_delete=models.CASCADE)
    club = models.ForeignKey(Club, on_delete=models.CASCADE, null=True, blank=True)
    player = models.ForeignKey(ClubPlayer, on_delete=models.CASCADE)
    notes = models.CharField(null=True, blank=True, max_length=255)

