from django.urls import path, include
from players import views


urlpatterns = [
    path('', views.players, name="players"),
    path('player', views.player, name="player"),
    path('players_api', views.players_api, name="players_api")
]
