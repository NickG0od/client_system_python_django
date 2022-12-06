from django.db import models
from users.models import User


class APIToken(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=100, null=True)
    accesses = models.JSONField(null=True, blank=True)
    ip_whitelist = models.JSONField(null=True, blank=True)
    ip_blacklist = models.JSONField(null=True, blank=True)
    date_created = models.DateField(auto_now_add=True)
    date_expired = models.DateField(null=True, blank=True)

    objects = models.Manager()

    def __str__(self):
        return f"Token for user: {self.user.email}"

