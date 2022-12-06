from django.urls import path, include
from api import views


urlpatterns = [
    path('exercises', views.exercises, name="exercises"),
]
