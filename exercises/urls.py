from django.urls import path, include
from exercises import views


urlpatterns = [
    path('', views.exercises, name="exercises"),
    path('exercise', views.exercise, name="exercise"),
    path('folders', views.folders, name="folders"),
    path('exercises_api', views.exercises_api, name="exercises_api"),
    path('folders_api', views.folders_api, name="folders_api")
]
