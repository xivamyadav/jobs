"""
Job Serializers - For List, Detail, Create/Update operations.
"""

from rest_framework import serializers
from jobs.models import Job
from company.models import Company

class JobListSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_logo = serializers.SerializerMethodField()
    posted_by_name = serializers.SerializerMethodField()
    application_status = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    location = serializers.StringRelatedField(read_only=True)
    location_id = serializers.IntegerField(source='location.id', read_only=True)
    required_skills = serializers.SerializerMethodField()

    def get_company_logo(self, obj):
        if obj.company and obj.company.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.company.logo.url)
            return obj.company.logo.url
        return None

    def get_posted_by_name(self, obj):
        return obj.posted_by.full_name if obj.posted_by else None

    def get_application_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.__class__.__name__ == 'CandidateUser':
            from candidate.models.job_application import JobApplication
            user = request.user
            profile = getattr(user, 'candidate_profile', None)
            if profile:
                app = JobApplication.objects.filter(candidate=profile, job=obj).first()
                if app:
                    return app.status
        return None

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.__class__.__name__ == 'CandidateUser':
            from candidate.models.saved_job import SavedJob
            user = request.user
            profile = getattr(user, 'candidate_profile', None)
            if profile:
                return SavedJob.objects.filter(candidate=profile, job=obj).exists()
        return False

    def get_required_skills(self, obj):
        if not obj.required_skills:
            return []
        try:
            from enterprise.models import Skill
            skills = Skill.objects.filter(skill_id__in=obj.required_skills).values_list('skill_name', flat=True)
            return list(skills)
        except Exception:
            return []

    class Meta:
        model = Job
        fields = [
            'id', 'job_code', 'title', 'company', 'company_name', 'company_logo', 'job_type',
            'location', 'location_id', 'is_remote', 'salary_min', 'salary_max',
            'experience_min', 'experience_max', 'views_count', 'applications_count',
            'status', 'created_at', 'published_at', 'posted_by_name',
            'application_status', 'is_saved', 'required_skills',
        ]


class JobDetailSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_logo = serializers.SerializerMethodField()
    posted_by_name = serializers.SerializerMethodField()
    application_status = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    required_skills_details = serializers.SerializerMethodField()
    
    location = serializers.StringRelatedField(read_only=True)
    location_id = serializers.IntegerField(source='location.id', read_only=True)

    def get_required_skills_details(self, obj):
        skills = obj.required_skills
        if not skills or not isinstance(skills, list):
            return []
        
        try:
            # Check if it's a list of integer IDs
            if all(isinstance(s, int) or (isinstance(s, str) and str(s).isdigit()) for s in skills):
                from enterprise.models import Skill
                skill_ids = [int(s) for s in skills]
                qs = Skill.objects.filter(skill_id__in=skill_ids)
                return [{"skill_id": s.skill_id, "skill_name": s.skill_name} for s in qs]
            else:
                # Legacy: list of strings
                return [{"skill_id": None, "skill_name": str(s)} for s in skills]
        except Exception as e:
            return []

    def get_company_logo(self, obj):
        if obj.company and obj.company.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.company.logo.url)
            return obj.company.logo.url
        return None

    def get_posted_by_name(self, obj):
        return obj.posted_by.full_name if obj.posted_by else None

    def get_application_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.__class__.__name__ == 'CandidateUser':
            from candidate.models.job_application import JobApplication
            user = request.user
            profile = getattr(user, 'candidate_profile', None)
            if profile:
                app = JobApplication.objects.filter(candidate=profile, job=obj).first()
                if app:
                    return app.status
        return None

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.__class__.__name__ == 'CandidateUser':
            from candidate.models.saved_job import SavedJob
            user = request.user
            profile = getattr(user, 'candidate_profile', None)
            if profile:
                return SavedJob.objects.filter(candidate=profile, job=obj).exists()
        return False

    class Meta:
        model = Job
        fields = [
            'id', 'job_code', 'title', 'description', 'company', 'company_name', 'company_logo',
            'job_type', 'location', 'location_id', 'is_remote', 'salary_min', 'salary_max', 'currency',
            'experience_min', 'experience_max', 'required_skills', 'required_skills_details', 'qualifications',
            'status', 'views_count', 'applications_count',
            'created_at', 'updated_at', 'published_at',
            'posted_by_name', 'application_status', 'is_saved',
        ]



class JobCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'description', 'company', 'job_type', 'location',
            'is_remote', 'salary_min', 'salary_max', 'currency',
            'experience_min', 'experience_max', 'required_skills', 'qualifications',
            'status', 'published_at',
        ]
        read_only_fields = ['id']
        extra_kwargs = {
            'company': {'required': False}
        }

    def _get_user_company(self, user):
        company = user.companies.first()
        if not company:
            # Auto-create a default company for the user
            company_name = getattr(user, 'full_name', '').strip()
            if not company_name:
                company_name = user.email.split('@')[0].capitalize()
            
            base_name = f"{company_name}'s Company"
            name = base_name
            counter = 1
            while Company.objects.filter(name=name).exists():
                name = f"{base_name} {counter}"
                counter += 1
                
            company = Company.objects.create(
                name=name,
                email=user.email,
            )
            company.users.add(user)
        return company
    

    

    def validate(self, data):
        if data.get('salary_min') and data.get('salary_max'):
            if data['salary_min'] > data['salary_max']:
                raise serializers.ValidationError(
                    "Minimum salary cannot be greater than maximum salary."
                )

        request = self.context.get('request')
        if request and request.user.is_authenticated:
            user = request.user

            company = data.get('company')

            # If company is not provided in partial update, take from instance
            if not company and self.instance:
                company = self.instance.company

            # In create, if company is not provided, use the user's company
            if not company and not self.instance:
                company = self._get_user_company(user)
                if company:
                    data['company'] = company

            if not company:
                raise serializers.ValidationError({
                    'company': 'No company found. Please create a company profile first.'
                })

            # Verify company belongs to this user
            if not Company.objects.filter(id=company.id, users=user).exists():
                raise serializers.ValidationError({
                    'company': 'You can only manage jobs for your own company.'
                })

        return data

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            user = request.user
            if not validated_data.get('company'):
                user_company = self._get_user_company(user)
                if user_company:
                    validated_data['company'] = user_company
        return super().create(validated_data)
