"""
Job Service - Business logic for Company Admin job management.
"""

from django.db.models import QuerySet, Q
from jobs.models.job_model import Job


class JobService:

    @staticmethod
    def get_company_jobs(user, filters: dict = None) -> QuerySet:
        """
        Fetch all jobs for the Company Admin.
        Optional filters: status, search, job_type
        """
        queryset = Job.objects.filter(
            Q(company__users=user) | Q(posted_by=user)
        ).distinct()

        if not filters:
            return queryset

        status_filter = filters.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        search = filters.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        job_type = filters.get('job_type')
        if job_type:
            queryset = queryset.filter(job_type=job_type)

        return queryset

    @staticmethod
    def get_job_applicant_count(job: Job) -> int:
        """Count of applications for a job."""
        return job.applicants.count()
