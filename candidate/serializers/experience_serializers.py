from rest_framework import serializers
from candidate.models.experience import Experience
from enterprise.serializers.location_serializers import LocationSerializer


class ExperienceSerializer(serializers.ModelSerializer):
    location_detail = LocationSerializer(source='location', read_only=True)

    class Meta:
        model = Experience
        fields = '__all__'
        read_only_fields = ['candidate', 'created_at']
