from rest_framework import serializers
from exercises.models import UserExercise, ExerciseVideo, AdminExercise, AdminFolder
from taggit.serializers import (TagListSerializerField,
                                TaggitSerializer)


# Exercise
from video.models import Video
#from video.serializers import VideoSerializer


class AdminFolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminFolder
        fields = '__all__'


class AdminExerciseSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    folder = AdminFolderSerializer(read_only=True)
    title = serializers.JSONField(read_only=True)

    # video = ExerciseVideoSerializer(
    #     read_only=True,
    #     source="exercisevideo_set",
    #     many=True
    # )

    class Meta:
        model = AdminExercise
        fields = [
            'id', 'folder', 'title', 'videos'
        ]


class ExerciseVideoSerializer(serializers.ModelSerializer):
    # video = VideoSerializer(
    #     read_only=True
    # )

    class Meta:
        model = ExerciseVideo
        fields = [
            'video', 'type'
        ]


class UserExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserExercise
        fields = [
            'user', 'completed', 'title'
        ]


class UserExerciseInTrainingSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserExercise
        fields = [
            'user', 'completed', 'title'
        ]
