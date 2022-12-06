from django.urls import path, include
from matches import views
from rest_framework import routers
from matches import views


urlpatterns = [
    path('', views.matches, name="base_matches"),
    path('match', views.match, name="base_match"),
    path('matches_api', views.matches_api, name="matches_api")
]
