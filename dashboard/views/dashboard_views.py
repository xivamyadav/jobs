"""
Dashboard Views - Analytics for Company Admin.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum

from jobs.models import Job
from candidate.models import JobApplication
from company.models import Company


from dashboard.services.analytics_service import AnalyticsService

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_stats(request):
    """
    GET /api/v1/dashboard/stats/
    Company Admin dashboard - summary of jobs and applicants.
    """
    user = request.user

    # Prevent ValueError if Candidate accesses this view
    if user.__class__.__name__ == 'CandidateUser':
        return Response(
            {'success': False, 'error': 'Candidates do not have a dashboard stats view.'},
            status=status.HTTP_403_FORBIDDEN
        )

    company = Company.objects.filter(users=user).first()
    if not company:
        return Response(
            {
                'success': False,
                'error': 'No company profile found. Please create your company profile first.',
            },
            status=status.HTTP_404_NOT_FOUND
        )

    timeframe = request.query_params.get('timeframe', 'This Week')
    
    data = AnalyticsService.get_company_dashboard_stats(company, timeframe=timeframe)
    
    if company.logo:
        data['company']['logo_url'] = request.build_absolute_uri(company.logo.url)
    else:
        data['company']['logo_url'] = None

    return Response(
        {
            'success': True,
            'data': data,
        },
        status=status.HTTP_200_OK
    )
