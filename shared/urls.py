from django.urls import path, include
from shared import views


urlpatterns = [
    path('', views.shared_link, name="link"),
    path('shared_link_api', views.shared_link_api, name="shared_link_api"),
]
