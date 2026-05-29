"""
Recruiter Views - Company Admin endpoints for managing candidate applications.

Naukri-style flow:
  - GET  application detail → auto-marks RESUME_VIEWED
  - PATCH update status → SHORTLISTED / NOT_SHORTLISTED / INTERVIEW / OFFER
  - GET  job applications → NOT_SHORTLISTED hidden by default
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from core.utils.custom_auth import CustomJWTAuthentication

from candidate.services.job_application_service import (
    get_application_for_recruiter,
    mark_resume_viewed,
    update_application_status,
    get_job_applications_for_recruiter,
)
from candidate.models.job_application import JobApplication
from candidate.serializers.job_serializers import JobApplicationSerializer, ResumeSerializer, RecruiterJobApplicationSerializer
from core.utils.pagination import StandardResultsSetPagination


class RecruiterApplicationListView(APIView):
    """
    GET /api/v1/job-applicants/<job_id>/
    Lists all applications for a job (NOT_SHORTLISTED hidden by default).
    Pass ?show_all=true to include NOT_SHORTLISTED.
    """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        show_all = request.query_params.get('show_all', 'false').lower() == 'true'
        apps = get_job_applications_for_recruiter(job_id, include_not_shortlisted=show_all)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(apps, request)
        serializer = RecruiterJobApplicationSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)


class RecruiterApplicationDetailView(APIView):
    """
    GET /api/v1/application/<pk>/
    When recruiter views a candidate's application profile.
    """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            app = get_application_for_recruiter(pk)
            return Response(RecruiterJobApplicationSerializer(app, context={'request': request}).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)


class RecruiterViewResumeAPI(APIView):
    """
    POST /api/v1/resume/<pk>/
    When recruiter clicks to view/download the resume.
    Marks status as RESUME_VIEWED and returns resume details.
    """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            app = mark_resume_viewed(pk)
            if app.resume:
                resume_data = ResumeSerializer(app.resume, context={'request': request}).data
            else:
                resume_data = None

            return Response({
                'message': 'Resume viewed successfully',
                'status': app.status,
                'resume': resume_data
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RecruiterUpdateStatusView(APIView):
    """
    PATCH /api/v1/application-status/<pk>/
    Body: { "status": "SHORTLISTED" }
    Valid: UNDER_REVIEW, SHORTLISTED, NOT_SHORTLISTED, INTERVIEW, OFFER
    """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        new_status = request.data.get('status')
        if not new_status:
            return Response(
                {'error': 'status field is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            app = update_application_status(pk, new_status)
            return Response({
                'message': f'Application status updated to {app.get_status_display()}',
                'application': RecruiterJobApplicationSerializer(app, context={'request': request}).data
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RecruiterAddNotesView(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        notes = request.data.get('employer_notes')
        if notes is None:
            return Response({'error': 'employer_notes field is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            app = JobApplication.objects.get(id=pk)
            app.recruiter_notes = notes
            app.save(update_fields=['recruiter_notes'])
            return Response({
                'success': True,
                'message': 'Notes added successfully',
                'application': RecruiterJobApplicationSerializer(app, context={'request': request}).data
            })
        except JobApplication.DoesNotExist:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
