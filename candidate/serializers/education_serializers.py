from rest_framework import serializers
from candidate.models.education import Education


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'
        read_only_fields = ['candidate', 'created_at']
