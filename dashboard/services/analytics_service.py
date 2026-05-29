from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncDay
from django.utils import timezone
from datetime import timedelta
from django.core.cache import cache
from jobs.models import Job
from candidate.models import JobApplication

class AnalyticsService:
    @staticmethod
    def get_company_dashboard_stats(company, timeframe='This Week'):
        # Disabled cache to ensure real-time analytics
        pass

        # Timeframe filtering
        now = timezone.now()
        if timeframe == 'This Month':
            start_date = now - timedelta(days=30)
        else: # Default to This Week
            start_date = now - timedelta(days=7)

        # Base Queries
        company_jobs = Job.objects.filter(company=company)
        company_applications = JobApplication.objects.filter(job__company=company)

        # Job Stats
        jobs_stats = company_jobs.aggregate(
            total=Count('id'),
            published=Count('id', filter=Q(status='published')),
            draft=Count('id', filter=Q(status='draft')),
            paused=Count('id', filter=Q(status='paused')),
            total_views=Sum('views_count')
        )
        total_jobs = jobs_stats['total'] or 0
        published_jobs = jobs_stats['published'] or 0
        draft_jobs = jobs_stats['draft'] or 0
        paused_jobs = jobs_stats['paused'] or 0
        total_views = jobs_stats['total_views'] or 0

        # Applicant Stats
        applicants_stats = company_applications.aggregate(
            total=Count('id'),
            new=Count('id', filter=Q(status='APPLIED')),
            shortlisted=Count('id', filter=Q(status='SHORTLISTED')),
            interviewing=Count('id', filter=Q(status='INTERVIEWING')),
            hired=Count('id', filter=Q(status='HIRED')),
            rejected=Count('id', filter=Q(status='REJECTED'))
        )
        total_applicants = applicants_stats['total'] or 0
        new_applicants = applicants_stats['new'] or 0
        
        # Recent Jobs with Annotations (prevent N+1)
        # applications_count is already a field on Job model, no need to annotate
        recent_jobs = company_jobs.order_by('-created_at')[:5]

        recent_jobs_data = [
            {
                'id': job.id,
                'title': job.title,
                'status': job.status,
                'applications_count': job.applications_count,
                'views_count': job.views_count,
                'salary_min': float(job.salary_min) if job.salary_min is not None else None,
                'salary_max': float(job.salary_max) if job.salary_max is not None else None,
                'currency': job.currency,
                'experience_min': job.experience_min,
                'experience_max': job.experience_max,
                'created_at': job.created_at.isoformat(),
            }
            for job in recent_jobs
        ]

        # Recent Applicants (optimized select_related)
        recent_applicants = company_applications.select_related(
            'candidate', 'candidate__user', 'job'
        ).order_by('-applied_at')[:5]

        recent_applicants_data = [
            {
                'id': a.id,
                'candidate_name': a.candidate.full_name,
                'candidate_email': a.candidate.user.email if hasattr(a.candidate, 'user') else (a.candidate.primary_email or ''),
                'job_title': a.job.title if a.job else '',
                'status': a.status,
                'applied_at': a.applied_at.isoformat(),
                'candidate_profile_picture': a.candidate.profile_picture.url if (hasattr(a.candidate, 'profile_picture') and a.candidate.profile_picture) else None,
            }
            for a in recent_applicants
        ]

        # Chart Data: Applications over time (Daily)
        # Group in python to avoid MySQL timezone table issues with TruncDay
        applications_in_period = company_applications.filter(
            applied_at__gte=start_date
        ).values_list('applied_at', flat=True)

        chart_dict_full = {}
        for app_date in applications_in_period:
            if app_date:
                # Convert to local timezone if needed, or just use date
                local_date = timezone.localtime(app_date).date() if timezone.is_aware(app_date) else app_date.date()
                chart_dict_full[local_date] = chart_dict_full.get(local_date, 0) + 1

        days_in_period = (now - start_date).days
        chart_data = []
        for i in range(days_in_period + 1):
            current_date = (start_date + timedelta(days=i)).date()
            label = current_date.strftime('%b %d') if timeframe == 'This Month' else current_date.strftime('%a')
            chart_data.append({
                'day': label,
                'applications': chart_dict_full.get(current_date, 0)
            })

        # Top Performing Job
        top_job = company_jobs.annotate(
            app_count=Count('candidate_applications')
        ).order_by('-app_count').first()
        
        top_job_data = None
        if top_job:
            top_job_data = {
                'id': top_job.id,
                'title': top_job.title,
                'applicants': top_job.app_count
            }

        result = {
            'company': {
                'id': company.id,
                'name': company.name,
                # logo_url to be appended in view
            },
            'jobs': {
                'total': total_jobs,
                'published': published_jobs,
                'draft': draft_jobs,
                'paused': paused_jobs,
                'total_views': total_views,
            },
            'applicants': {
                'total': total_applicants,
                'new': new_applicants,
                'status_breakdown': {
                    'APPLIED': applicants_stats['new'] or 0,
                    'SHORTLISTED': applicants_stats['shortlisted'] or 0,
                    'INTERVIEWING': applicants_stats['interviewing'] or 0,
                    'HIRED': applicants_stats['hired'] or 0,
                    'REJECTED': applicants_stats['rejected'] or 0,
                },
            },
            'recent_jobs': recent_jobs_data,
            'recent_applicants': recent_applicants_data,
            'chart_data': chart_data,
            'top_performing_job': top_job_data,
        }

        return result
