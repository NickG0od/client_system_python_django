from django.contrib import admin
from players.models import UserPlayer, ClubPlayer


class WithID(admin.ModelAdmin):
    readonly_fields = ('id',)


admin.site.register(UserPlayer, WithID)
admin.site.register(ClubPlayer, WithID)
