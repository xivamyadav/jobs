"""Job Application Views — Apply, list applications, view detail."""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from candidate.services import job_application_service
from candidate.serializers.job_serializers import JobApplicationSerializer
from core.utils.pagination import StandardResultsSetPagination
from candidate.exceptions import CandidateException


class JobApplicationListView(APIView):
    """
    Candidate's application list.
    ?filter=active  → hides NOT_SHORTLISTED (default)
    ?filter=all     → shows everything
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        filter_type = request.query_params.get('filter', 'active')
        if filter_type == 'all':
            apps = job_application_service.list_applications(request.user)
        else:
            apps = job_application_service.list_active_applications(request.user)

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(apps, request)
        serializer = JobApplicationSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)


class JobApplicationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            app = job_application_service.get_application_detail(request.user, pk)
            return Response({
                'success': True,
                'data': JobApplicationSerializer(app, context={'request': request}).data,
            })
        except CandidateException as e:
            return Response({
                'success': False, 'error': e.error_code, 'message': str(e),
            }, status=e.status_code)


class JobApplyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, job_id):
        try:
            app = job_application_service.apply_to_job(request.user, job_id, request.data)
            return Response({
                'success': True,
                'message': 'Successfully applied to job!',
                'data': JobApplicationSerializer(app, context={'request': request}).data,
            }, status=status.HTTP_201_CREATED)
        except CandidateException as e:
            return Response({
                'success': False, 'error': e.error_code, 'message': str(e),
            }, status=e.status_code)
