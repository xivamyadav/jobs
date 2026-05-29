from rest_framework import serializers
from candidate.models.job_application import JobApplication
from candidate.models.saved_job import SavedJob
from candidate.serializers.profile_serializers import CandidateProfileSerializer
from candidate.serializers.resume_serializers import ResumeSerializer
from jobs.serializers.job_serializers import JobDetailSerializer, JobListSerializer


class JobApplicationSerializer(serializers.ModelSerializer):
    """Naukri-style application serializer with status timeline."""
    job_detail = JobDetailSerializer(source='job', read_only=True)
    candidate_detail = serializers.SerializerMethodField()
    resume_detail = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    timeline = serializers.SerializerMethodField()

    def get_candidate_detail(self, obj):
        return CandidateProfileSerializer(
            obj.candidate, context=self.context
        ).data if obj.candidate else None

    def get_resume_detail(self, obj):
        return ResumeSerializer(
            obj.resume, context=self.context
        ).data if obj.resume else None

    class Meta:
        model = JobApplication
        fields = [
            'id', 'candidate', 'candidate_detail', 'job', 'job_detail', 'resume', 'resume_detail',
            'status', 'status_display',
            'cover_letter', 'expected_salary', 'notice_period',
            'resume_viewed_at', 'shortlisted_at', 'not_shortlisted_at',
            'applied_at', 'updated_at', 'timeline'
        ]
        read_only_fields = [
            'candidate', 'job', 'status', 'applied_at', 'updated_at',
            'resume_viewed_at', 'shortlisted_at', 'not_shortlisted_at'
        ]

    def get_timeline(self, obj):
        """Build a Naukri-style status timeline for the candidate."""
        events = []
        events.append({
            'event': 'Applied',
            'date': obj.applied_at,
            'done': True
        })
        events.append({
            'event': 'Resume Viewed',
            'date': obj.resume_viewed_at,
            'done': obj.resume_viewed_at is not None
        })
        if obj.status == 'NOT_SHORTLISTED':
            events.append({
                'event': 'Not Shortlisted',
                'date': obj.not_shortlisted_at,
                'done': True
            })
        else:
            events.append({
                'event': 'Shortlisted',
                'date': obj.shortlisted_at,
                'done': obj.shortlisted_at is not None
            })
        return events


class SavedJobSerializer(serializers.ModelSerializer):
    """Saved job with full job details for the candidate dashboard."""
    job_detail = JobListSerializer(source='job', read_only=True)

    class Meta:
        model = SavedJob
        fields = ['id', 'job', 'job_detail', 'created_at']
        read_only_fields = ['created_at']


class RecruiterJobApplicationSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source='candidate.full_name', read_only=True)
    candidate_email = serializers.SerializerMethodField()
    candidate_detail = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(source='applied_at', read_only=True)
    resume = serializers.SerializerMethodField()
    employer_notes = serializers.CharField(source='recruiter_notes', read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            'id', 'candidate_name', 'candidate_email', 'candidate_detail', 'status', 'created_at', 'resume', 'employer_notes'
        ]

    def get_candidate_email(self, obj):
        if obj.candidate and hasattr(obj.candidate, 'user'):
            return obj.candidate.user.email
        if obj.candidate and obj.candidate.primary_email:
            return obj.candidate.primary_email
        return "N/A"

    def get_resume(self, obj):
        if obj.resume and hasattr(obj.resume, 'resume_file') and obj.resume.resume_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.resume.resume_file.url)
            return obj.resume.resume_file.url
        return None

    def get_candidate_detail(self, obj):
        from candidate.serializers.profile_serializers import CandidateProfileSerializer
        if obj.candidate:
            return CandidateProfileSerializer(obj.candidate, context=self.context).data
        return None
