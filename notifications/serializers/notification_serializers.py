from rest_framework import serializers
from notifications.models import Notification
from candidate.models import JobApplication

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'