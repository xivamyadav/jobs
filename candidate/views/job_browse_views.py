"""Job Browse Views — Public job listing, detail, saved jobs for candidates."""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from jobs.models.job_model import Job
from jobs.serializers.job_serializers import JobListSerializer, JobDetailSerializer
from core.utils.pagination import StandardResultsSetPagination
from candidate.models.saved_job import SavedJob
from candidate.services.candidateprofile_service import get_or_create_profile
from candidate.serializers.job_serializers import SavedJobSerializer
from company.models import Company
from company.serializers.company_serializers import CompanySerializers


class CandidateCompanyDetailView(APIView):
    """Public read-only view for a candidate to see company details."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            company = Company.objects.get(id=pk)
            serializer = CompanySerializers(company, context={'request': request})
            return Response({
                'success': True,
                'data': serializer.data
            })
        except Company.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Company not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class CandidateJobBrowseView(APIView):
    """
    GET /api/v1/candidate/jobs/browse/
    Paginated job listing with search/filter support.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        search = request.query_params.get('search', '')
        job_type = request.query_params.get('job_type')
        experience_level = request.query_params.get('experience_level')
        is_remote = request.query_params.get('is_remote')
        location = request.query_params.get('location')

        qs = Job.objects.filter(status='published').select_related('company')

        if search:
            from enterprise.models import Skill
            matching_ids = Skill.objects.filter(skill_name__icontains=search).values_list('skill_id', flat=True)
            skill_q = Q()
            for sid in matching_ids:
                skill_q |= Q(required_skills__contains=sid)
                
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(company__name__icontains=search) |
                skill_q
            )
            
        if job_type:
            qs = qs.filter(job_type=job_type)
        if experience_level:
            qs = qs.filter(experience_level=experience_level)
        if is_remote is not None:
            if is_remote.lower() in ['true', '1', 'yes']:
                qs = qs.filter(is_remote=True)
            elif is_remote.lower() in ['false', '0', 'no']:
                qs = qs.filter(is_remote=False)
        if location:
            qs = qs.filter(location__icontains=location)

        qs = qs.order_by('-published_at')

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = JobListSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)


class CandidateJobDetailView(APIView):
    """GET /api/v1/candidate/jobs/<id>/ — Published job detail."""
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        try:
            job = Job.objects.select_related('company').get(id=job_id, status='published')
            return Response({
                'success': True,
                'data': JobDetailSerializer(job, context={'request': request}).data,
            })
        except Job.DoesNotExist:
            return Response({
                'success': False, 'error': 'JOB_NOT_FOUND', 'message': 'Job not found.',
            }, status=status.HTTP_404_NOT_FOUND)


class SavedJobListView(APIView):
    """GET — List all saved jobs for the logged-in candidate."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_or_create_profile(request.user)
        saved = SavedJob.objects.filter(candidate=profile).select_related('job', 'job__company')
        return Response({
            'success': True,
            'data': SavedJobSerializer(saved, many=True, context={'request': request}).data,
        })


class SaveJobView(APIView):
    """POST — Save a job.  DELETE — Unsave a job."""
    permission_classes = [IsAuthenticated]

    def post(self, request, job_id):
        profile = get_or_create_profile(request.user)
        try:
            job = Job.objects.get(id=job_id, status='published')
        except Job.DoesNotExist:
            return Response({
                'success': False, 'error': 'JOB_NOT_FOUND', 'message': 'Job not found.',
            }, status=status.HTTP_404_NOT_FOUND)

        saved, created = SavedJob.objects.get_or_create(candidate=profile, job=job)
        if not created:
            return Response({
                'success': True, 'message': 'Job already saved.',
            })
        return Response({
            'success': True,
            'message': 'Job saved successfully.',
            'data': SavedJobSerializer(saved).data,
        }, status=status.HTTP_201_CREATED)

    def delete(self, request, job_id):
        profile = get_or_create_profile(request.user)
        deleted, _ = SavedJob.objects.filter(candidate=profile, job_id=job_id).delete()
        if deleted:
            return Response({'success': True, 'message': 'Job unsaved.'})
        return Response({
            'success': False, 'error': 'NOT_SAVED', 'message': 'Job was not saved.',
        }, status=status.HTTP_404_NOT_FOUND)
