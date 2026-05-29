from rest_framework import serializers
from candidate.models.resume import Resume


class ResumeSerializer(serializers.ModelSerializer):
    resume_url = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = [
            'id', 'candidate', 'file_name', 'resume_url',
            'file_mime', 'file_size_bytes', 'is_active', 'uploaded_at'
        ]
        read_only_fields = ['candidate', 'uploaded_at', 'file_name', 'file_mime', 'file_size_bytes', 'is_active']

    def get_resume_url(self, obj):
        """Always return a fully-qualified absolute URL for the resume file."""
        request = self.context.get('request')
        if obj.resume_file and request:
            return request.build_absolute_uri(obj.resume_file.url)
        if obj.resume_file:
            return obj.resume_file.url
        return None
