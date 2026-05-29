"""
Job Views - COMPANY_ADMIN manages their jobs.
Candidates browse jobs from the candidate app - this is company side only.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from jobs.models import Job
from jobs.serializers.job_serializers import (
    JobDetailSerializer,
    JobListSerializer,
    JobCreateUpdateSerializer,
)
from core.utils.pagination import StandardResultsSetPagination
from core.utils.custom_auth import CustomJWTAuthentication


class JobViewSet(viewsets.ModelViewSet):
    """
    Job CRUD for COMPANY_ADMIN.
    - List/Create/Update/Delete company jobs
    - Publish / Pause actions
    """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'job_type', 'is_remote']
    search_fields = ['title', 'description', 'job_code']
    ordering_fields = ['created_at', 'published_at', 'views_count', 'applications_count']
    ordering = ['-created_at']

    def get_queryset(self):
        """Company admin sirf apni company ki jobs dekhega."""
        user = self.request.user
        
        # Prevent ValueError if Candidate accesses this view
        if user.__class__.__name__ == 'CandidateUser':
            return Job.objects.none()
            
        return Job.objects.filter(
            Q(company__users=user) | Q(posted_by=user)
        ).distinct()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return JobDetailSerializer
        elif self.action == 'list':
            return JobListSerializer
        return JobCreateUpdateSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        job = self.get_object()
        job.delete()
        return Response(
            {'success': True, 'message': 'Job deleted successfully.'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """POST /api/v1/jobs/{id}/publish/"""
        job = self.get_object()
        if job.status == 'published':
            return Response(
                {'success': False, 'message': 'Job is already published.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        job.status = 'published'
        job.published_at = timezone.now()
        job.save(update_fields=['status', 'published_at'])
        return Response(
            {'success': True, 'message': 'Job published successfully.'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """POST /api/v1/jobs/{id}/pause/"""
        job = self.get_object()
        job.status = 'paused'
        job.save(update_fields=['status'])
        return Response(
            {'success': True, 'message': 'Job paused.'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        """POST /api/v1/jobs/{id}/increment_views/ — Rate-limited by IP per job."""
        job = self.get_object()
        # SECURITY: IP-based deduplication — 1 view per IP per job per 24h
        from django.core.cache import cache
        ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', 'unknown'))
        if ',' in ip:
            ip = ip.split(',')[0].strip()
        cache_key = f"job_view_{job.id}_{ip}"
        if not cache.get(cache_key):
            job.views_count += 1
            job.save(update_fields=['views_count'])
            cache.set(cache_key, True, 86400)  # 24 hours
        return Response(
            {'success': True, 'views': job.views_count},
            status=status.HTTP_200_OK
        )
