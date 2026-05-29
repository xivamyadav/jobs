"""
Candidate Insights API — Real-time analytics for application tracking.
Returns stats, trend data, and detailed breakdowns.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta

from candidate.models.job_application import JobApplication
from candidate.services.candidateprofile_service import get_or_create_profile


class CandidateInsightsView(APIView):
    """GET /api/v1/candidate/insights/ — Real-time application analytics."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_or_create_profile(request.user)
        apps = JobApplication.objects.filter(candidate=profile)

        now = timezone.now()
        week_ago = now - timedelta(days=7)

        # ── Overall counts ──
        total = apps.count()
        applied = apps.filter(status='APPLIED').count()
        shortlisted = apps.filter(status='SHORTLISTED').count()
        not_shortlisted = apps.filter(status='NOT_SHORTLISTED').count()
        under_review = apps.filter(status__in=['UNDER_REVIEW', 'RESUME_VIEWED']).count()
        interview = apps.filter(status='INTERVIEW').count()
        offered = apps.filter(status__in=['OFFERED', 'HIRED']).count()

        # ── This week changes ──
        applied_this_week = apps.filter(applied_at__gte=week_ago).count()
        shortlisted_this_week = apps.filter(
            shortlisted_at__gte=week_ago, status='SHORTLISTED'
        ).count()
        not_shortlisted_this_week = apps.filter(
            not_shortlisted_at__gte=week_ago, status='NOT_SHORTLISTED'
        ).count()
        profile_views_this_week = apps.filter(
            Q(resume_viewed_at__gte=week_ago) |
            (Q(status='RESUME_VIEWED') & Q(updated_at__gte=week_ago))
        ).count()

        # ── Daily trend for past 7 days (Cumulative) ──
        days = []
        for i in range(6, -1, -1):
            day = (now - timedelta(days=i)).date()
            days.append(day)

        trend = []
        for day in days:
            end_of_day = timezone.make_aware(timezone.datetime.combine(day, timezone.datetime.max.time()))
            
            cum_applied = apps.filter(applied_at__lte=end_of_day).count()
            
            cum_shortlisted = apps.filter(
                Q(shortlisted_at__lte=end_of_day) | 
                (Q(status='SHORTLISTED') & Q(updated_at__lte=end_of_day))
            ).count()
            
            cum_not_shortlisted = apps.filter(
                Q(not_shortlisted_at__lte=end_of_day) | 
                (Q(status='NOT_SHORTLISTED') & Q(updated_at__lte=end_of_day))
            ).count()

            cum_profile_views = apps.filter(
                Q(resume_viewed_at__lte=end_of_day) | 
                (Q(status='RESUME_VIEWED') & Q(updated_at__lte=end_of_day))
            ).count()

            trend.append({
                'date': day.strftime('%d %b'),
                'applied': cum_applied,
                'shortlisted': cum_shortlisted,
                'not_shortlisted': cum_not_shortlisted,
                'profile_views': cum_profile_views,
            })

        # ── Detailed breakdown: which companies shortlisted/rejected ──
        shortlisted_apps = list(
            apps.filter(status='SHORTLISTED')
            .select_related('job', 'job__company')
            .values(
                'id', 'job__title', 'job__company__name',
                'shortlisted_at', 'applied_at'
            )[:20]
        )

        not_shortlisted_apps = list(
            apps.filter(status='NOT_SHORTLISTED')
            .select_related('job', 'job__company')
            .values(
                'id', 'job__title', 'job__company__name',
                'not_shortlisted_at', 'applied_at'
            )[:20]
        )

        # ── Recent Activity (latest 5 application updates) ──
        recent_apps = list(
            apps.select_related('job', 'job__company')
            .order_by('-updated_at')[:5]
            .values(
                'id', 'job__title', 'job__company__name',
                'status', 'updated_at'
            )
        )

        # Date range string
        start_date = days[0].strftime('%d %b')
        end_date = days[-1].strftime('%d %b %Y')

        return Response({
            'success': True,
            'data': {
                'date_range': f"{start_date} – {end_date}",
                'stats': {
                    'total': total,
                    'applied': applied,
                    'shortlisted': shortlisted,
                    'not_shortlisted': not_shortlisted,
                    'under_review': under_review,
                    'interview': interview,
                    'offered': offered,
                    'profile_views': apps.filter(Q(status='RESUME_VIEWED') | Q(resume_viewed_at__isnull=False)).count(),
                },
                'this_week': {
                    'applied': applied_this_week,
                    'shortlisted': shortlisted_this_week,
                    'not_shortlisted': not_shortlisted_this_week,
                    'profile_views': profile_views_this_week,
                },
                'trend': trend,
                'recent_activity': [
                    {
                        'id': a['id'],
                        'job_title': a['job__title'],
                        'company_name': a['job__company__name'],
                        'status': a['status'],
                        'date': a['updated_at'].strftime('%d %b %Y, %I:%M %p') if a.get('updated_at') else '',
                    }
                    for a in recent_apps
                ],
                'shortlisted_details': [
                    {
                        'id': a['id'],
                        'job_title': a['job__title'],
                        'company_name': a['job__company__name'],
                        'date': a['shortlisted_at'].strftime('%d %b %Y') if a.get('shortlisted_at') else '',
                    }
                    for a in shortlisted_apps
                ],
                'not_shortlisted_details': [
                    {
                        'id': a['id'],
                        'job_title': a['job__title'],
                        'company_name': a['job__company__name'],
                        'date': a['not_shortlisted_at'].strftime('%d %b %Y') if a.get('not_shortlisted_at') else '',
                    }
                    for a in not_shortlisted_apps
                ],
            }
        })
