from rest_framework import serializers
from candidate.models.candidateprofile import CandidateProfile


class CandidateProfileSerializer(serializers.ModelSerializer):
    """Full profile read serializer — used for GET responses."""
    email = serializers.SerializerMethodField()
    phone_number = serializers.SerializerMethodField()
    experiences = serializers.SerializerMethodField()
    educations = serializers.SerializerMethodField()
    resume = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()
    certifications = serializers.SerializerMethodField()

    city = serializers.CharField(read_only=True)
    state = serializers.CharField(source='state_name', read_only=True)
    country = serializers.CharField(source='country_name', read_only=True)

    def get_email(self, obj):
        """Email from CandidateUser account."""
        return obj.user.email if obj.user else None

    def get_phone_number(self, obj):
        """Phone from CandidateUser account."""
        return obj.user.phone_number if obj.user else None

    def get_experiences(self, obj):
        from candidate.serializers.experience_serializers import ExperienceSerializer
        return ExperienceSerializer(obj.candidate_experiences.all(), many=True).data

    def get_educations(self, obj):
        from candidate.serializers.education_serializers import EducationSerializer
        return EducationSerializer(obj.educations.all(), many=True).data

    def get_resume(self, obj):
        from candidate.serializers.resume_serializers import ResumeSerializer
        try:
            resume = obj.resume
        except Exception:
            return None
        return ResumeSerializer(resume, context=self.context).data

    def get_skills(self, obj):
        from candidate.serializers.skill_serializers import CandidateSkillSerializer
        return CandidateSkillSerializer(obj.candidate_skills.all(), many=True).data

    def get_certifications(self, obj):
        from candidate.serializers.certification_serializers import CertificationSerializer
        return CertificationSerializer(obj.certifications.all(), many=True).data

    class Meta:
        model = CandidateProfile
        fields = [
            'id', 'email', 'phone_number', 'full_name', 'headline', 'about',
            'gender', 'date_of_birth', 'profile_picture',
            'current_designation', 'total_experience_years', 'total_experience_months',
            'is_fresher',
            'current_salary_lpa', 'expected_salary_lpa',
            'notice_period_days',
            'location', 'city', 'state', 'country',
            'experiences', 'educations', 'resume', 'skills', 'certifications',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['email', 'phone_number', 'created_at', 'updated_at']


class CandidateProfileUpdateSerializer(serializers.ModelSerializer):
    """Used for PATCH — all fields are optional (partial update)."""
    location_id = serializers.IntegerField(required=False, allow_null=True)
    phone_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = CandidateProfile
        fields = [
            'full_name', 'headline', 'about', 'gender', 'date_of_birth', 'profile_picture',
            'phone_number',
            'current_designation', 'total_experience_years', 'total_experience_months',
            'is_fresher',
            'current_salary_lpa', 'expected_salary_lpa',
            'notice_period_days',
            'location_id'
        ]
        extra_kwargs = {
            'full_name':                 {'required': False},
            'headline':                  {'required': False, 'allow_blank': True},
            'about':                     {'required': False, 'allow_blank': True},
            'gender':                    {'required': False, 'allow_null': True},
            'date_of_birth':             {'required': False, 'allow_null': True},
            'current_designation':       {'required': False, 'allow_blank': True},
            'total_experience_years':    {'required': False},
            'total_experience_months':   {'required': False},
            'is_fresher':                {'required': False},
            'current_salary_lpa':        {'required': False, 'allow_null': True},
            'expected_salary_lpa':       {'required': False, 'allow_null': True},
            'notice_period_days':        {'required': False, 'allow_null': True},
        }
