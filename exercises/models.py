from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from users.models import User
from clubs.models import Club
from references.models import UserTeam, ClubTeam
from references.models import ExsGoal, ExsBall, ExsTeamCategory, ExsAgeCategory, ExsTrainPart, ExsCognitiveLoad
from video.models import Video


class AbstractExercise(models.Model):
    date_creation = models.DateField(auto_now_add=True)
    order = models.IntegerField(
        help_text='Индекс сортировки',
        default=0
    )
    visible = models.BooleanField(
        help_text='Показывать упр-ие пользователю или нет',
        default=True
    )
    completed = models.BooleanField(
        help_text='Упражнение завершено',
        default=False
    )
    completed_time = models.DateField(
        help_text='Когда упр-ие было завершено',
        blank=True, null=True
    )
    title = models.JSONField(null=True, blank=True)
    ref_goal = models.ForeignKey(ExsGoal, on_delete=models.SET_NULL, null=True, blank=True)
    ref_ball = models.ForeignKey(ExsBall, on_delete=models.SET_NULL, null=True, blank=True)
    ref_team_category = models.ForeignKey(ExsTeamCategory, on_delete=models.SET_NULL, null=True, blank=True)
    ref_age_category = models.ForeignKey(ExsAgeCategory, on_delete=models.SET_NULL, null=True, blank=True)
    ref_train_part = models.ForeignKey(ExsTrainPart, on_delete=models.SET_NULL, null=True, blank=True)
    ref_cognitive_load = models.ForeignKey(ExsCognitiveLoad, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.JSONField(null=True, blank=True)
    scheme_data = models.JSONField(null=True, blank=True)
    video_data = models.JSONField(null=True, blank=True)
    animation_data = models.JSONField(null=True, blank=True)
    old_id = models.IntegerField(null=True, blank=True)
    clone_nfb_id = models.IntegerField(null=True, blank=True)

    objects = models.Manager()

    class Meta():
        abstract = True
        ordering = ['order']
    def __str__(self):
        return f"[id: {self.id}]"


class AdminExercise(AbstractExercise):
    folder = models.ForeignKey(AdminFolder, on_delete=models.CASCADE)
    videos = models.ManyToManyField(Video, through="ExerciseVideo", through_fields=("exercise_nfb", "video"))
    class Meta(AbstractExercise.Meta):
        abstract = False


class UserExercise(AbstractExercise):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    folder = models.ForeignKey(UserFolder, on_delete=models.CASCADE)
    videos = models.ManyToManyField(Video, through="ExerciseVideo", through_fields=("exercise_user", "video"))
    class Meta(AbstractExercise.Meta):
        abstract = False


class ClubExercise(AbstractExercise):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    club = models.ForeignKey(Club, on_delete=models.CASCADE, null=True, blank=True)
    team = models.ForeignKey(ClubTeam, on_delete=models.CASCADE, null=True, blank=True)
    folder = models.ForeignKey(ClubFolder, on_delete=models.CASCADE)
    videos = models.ManyToManyField(Video, through="ExerciseVideo", through_fields=("exercise_club", "video"))
    class Meta(AbstractExercise.Meta):
        abstract = False


class ExerciseVideo(models.Model):
    exercise_nfb = models.ForeignKey(AdminExercise, on_delete=models.CASCADE, null=True, blank=True)
    exercise_user = models.ForeignKey(UserExercise, on_delete=models.CASCADE, null=True, blank=True)
    exercise_club = models.ForeignKey(ClubExercise, on_delete=models.CASCADE, null=True, blank=True)
    video = models.ForeignKey(Video, on_delete=models.CASCADE, null=True, blank=True, related_name="video")
    type = models.IntegerField(
        help_text='1-2 - видео, 3-4 - анимация',
        default=0,
        validators=[
            MaxValueValidator(4),
            MinValueValidator(1)
        ],
    )
    order = models.IntegerField(default=0)
    
    objects = models.Manager()


class UserExerciseParam(models.Model):
    exercise_user = models.ForeignKey(UserExercise, on_delete=models.CASCADE, null=True, blank=True)
    exercise_club = models.ForeignKey(ClubExercise, on_delete=models.CASCADE, null=True, blank=True)
    exercise_nfb = models.ForeignKey(AdminExercise, on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    watched = models.BooleanField(default=False)
    favorite = models.BooleanField(default=False)
    like = models.BooleanField(default=False)
    dislike = models.BooleanField(default=False)
    video_1_watched = models.BooleanField(default=False)
    video_2_watched = models.BooleanField(default=False)
    animation_1_watched = models.BooleanField(default=False)
    animation_2_watched = models.BooleanField(default=False)

    objects = models.Manager()


class UserExerciseParamTeam(models.Model):
    exercise_user = models.ForeignKey(UserExercise, on_delete=models.CASCADE, null=True, blank=True)
    exercise_club = models.ForeignKey(ClubExercise, on_delete=models.CASCADE, null=True, blank=True)
    exercise_nfb = models.ForeignKey(AdminExercise, on_delete=models.CASCADE, null=True, blank=True)
    team = models.ForeignKey(UserTeam, on_delete=models.SET_NULL, null=True)
    team_club = models.ForeignKey(ClubTeam, on_delete=models.SET_NULL, null=True)

    additional_data = models.JSONField(null=True, blank=True)

    keyword = models.JSONField(null=True, blank=True)
    stress_type = models.JSONField(null=True, blank=True)
    purpose = models.JSONField(null=True, blank=True)
    coaching = models.JSONField(null=True, blank=True)
    note = models.JSONField(null=True, blank=True)

    objects = models.Manager()



