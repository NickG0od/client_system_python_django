from rest_framework import serializers

from players.models import UserPlayer, ClubPlayer


class PlayerSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    full_name = serializers.CharField(
        source="get_part_name",
        read_only=True
    )

    class Meta:
        fields = [
            'id', 'full_name'
        ]


class UserPlayerSerializer(PlayerSerializer):
    class Meta(PlayerSerializer.Meta):
        model = UserPlayer


class ClubPlayerSerializer(PlayerSerializer):
    class Meta(PlayerSerializer.Meta):
        model = ClubPlayer
