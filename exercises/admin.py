from django.contrib import admin
from exercises.models import AdminFolder, UserFolder, ClubFolder, AdminExercise, UserExercise
from exercises.models import UserExerciseParam, UserExerciseParamTeam


admin.site.register(AdminFolder)
admin.site.register(UserFolder)
admin.site.register(ClubFolder)

admin.site.register(AdminExercise)
admin.site.register(UserExercise)

admin.site.register(UserExerciseParam)
admin.site.register(UserExerciseParamTeam)

