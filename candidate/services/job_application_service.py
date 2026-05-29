"""
Job Application Service — Apply, list, status management.
Handles both candidate-side and recruiter-side operations.
"""

import logging
from django.utils import timezone
from datetime import timedelta
from candidate.models.job_application import JobApplication
from candidate.services.candidateprofile_service import get_or_create_profile
from candidate.services.resume_service import get_resume
from candidate.exceptions import (
    AlreadyApplied, ApplicationRejected, ApplicationNotFound,
    ProfileIncomplete, ResumeRequired, JobNotFound, InvalidStatus,
)
from jobs.models.job_model import Job
from dashboard.services.broadcast_service import BroadcastService

logger = logging.getLogger(__name__)


def apply_to_job(user, job_id, data):
    """Candidate applies to a published job."""
    profile = get_or_create_profile(user)

    try:
        job = Job.objects.get(id=job_id, status='published')
    except Job.DoesNotExist:
        raise JobNotFound()

    existing_app = JobApplication.objects.filter(candidate=profile, job=job).first()
    if existing_app:
        if existing_app.status == 'NOT_SHORTLISTED':
            raise ApplicationRejected()
        raise AlreadyApplied()

    # Profile completion score was removed from the database, skipping check
    # if profile.profile_completion_score < 40:
    #     raise ProfileIncomplete("Please complete your profile (at least 40%) before applying.")

    resume = get_resume(user)
    if not resume:
        raise ResumeRequired()

    application = JobApplication.objects.create(
        candidate=profile,
        job=job,
        resume=resume,
        cover_letter=data.get('cover_letter') or '',
        expected_salary=data.get('expected_salary') or None,
        notice_period=data.get('notice_period') or None,
        status='APPLIED'
    )

    logger.info(f"Application created id={application.id} user_id={user.id} job_id={job_id}")

    # Notification — wrapped so failure doesn't block the apply flow
    try:
        from notifications.models.notification_model import Notification
        for admin in job.company.users.all():
            Notification.objects.create(
                recipient=admin,
                notification_type='NEW_APPLICATION',
                title="New Job Application",
                message=f"{profile.full_name} applied for {job.title}",
                related_job=job,
                related_application=application
            )
    except Exception as e:
        logger.warning(f"Failed to create admin notification for application id={application.id}: {e}")

    try:
        from notifications.models.notification_model import Notification
        Notification.objects.create(
            recipient=user,
            notification_type='SYSTEM',
            title="Application Submitted",
            message=f"You have successfully applied for {job.title}",
            related_job=job,
            related_application=application
        )
    except Exception as e:
        logger.warning(f"Failed to create candidate notification for application id={application.id}: {e}")

    # Update job counter
    job.applications_count += 1
    job.save(update_fields=['applications_count'])

    # Broadcast to dashboard
    BroadcastService.notify_dashboard(job.company_id, event_type="NEW_APPLICATION")

    return application


def list_applications(user):
    """Candidate sees all their applications."""
    profile = get_or_create_profile(user)
    return (
        JobApplication.objects
        .filter(candidate=profile)
        .select_related('job', 'job__company')
        .order_by('-applied_at')
    )


def list_active_applications(user):
    """Candidate sees all applications (previously excluded NOT_SHORTLISTED)."""
    profile = get_or_create_profile(user)
    return (
        JobApplication.objects
        .filter(candidate=profile)
        .select_related('job', 'job__company')
        .order_by('-applied_at')
    )


def get_application_detail(user, application_id):
    """Candidate views a specific application."""
    profile = get_or_create_profile(user)
    try:
        return JobApplication.objects.select_related('job', 'job__company').get(
            id=application_id, candidate=profile
        )
    except JobApplication.DoesNotExist:
        raise ApplicationNotFound()


# ── Company/Recruiter side actions ──────────────────────────────────────

def _recruiter_queryset():
    """Base queryset with all candidate-related data pre-loaded."""
    return JobApplication.objects.select_related(
        'candidate', 'candidate__user',
        'candidate__location', 'candidate__location__state', 'candidate__location__country',
        'resume', 'job', 'job__company'
    ).prefetch_related(
        'candidate__resume',
        'candidate__candidate_skills', 'candidate__candidate_skills__skill',
        'candidate__candidate_experiences',
        'candidate__educations',
        'candidate__certifications',
    )


def get_application_for_recruiter(application_id):
    """Recruiter views a candidate's application detail."""
    try:
        app = _recruiter_queryset().get(id=application_id)
        
        # ── Real-time Profile View Update ──
        # Update resume_viewed_at and change status if it was just APPLIED
        update_fields = []
        if app.status == 'APPLIED':
            app.status = 'RESUME_VIEWED'
            update_fields.append('status')
        if not app.resume_viewed_at:
            app.resume_viewed_at = timezone.now()
            update_fields.append('resume_viewed_at')
            
        if update_fields:
            app.save(update_fields=update_fields)

        # Trigger Profile Viewed notification
        try:
            from notifications.models.notification_model import Notification
            recently_viewed = Notification.objects.filter(
                candidate_recipient=app.candidate.user,
                notification_type='PROFILE_VIEW',
                related_application=app,
                created_at__gte=timezone.now() - timedelta(hours=24)
            ).exists()
            if not recently_viewed:
                company_name = app.job.company.name if app.job and app.job.company else "A company"
                Notification.objects.create(
                    candidate_recipient=app.candidate.user,
                    notification_type='PROFILE_VIEW',
                    title='Profile Viewed',
                    message=f'A recruiter from {company_name} viewed your profile.',
                    related_job=app.job,
                    related_application=app
                )
        except Exception as e:
            logger.warning(f"Failed to create profile view notification: {e}")
            
        return app
    except JobApplication.DoesNotExist:
        raise ApplicationNotFound()


def mark_resume_viewed(application_id):
    """Explicitly called when recruiter opens the actual resume file."""
    try:
        app = JobApplication.objects.get(id=application_id)
        if app.status == 'APPLIED':
            app.status = 'RESUME_VIEWED'
            app.resume_viewed_at = timezone.now()
            app.save(update_fields=['status', 'resume_viewed_at', 'updated_at'])
            
        # Trigger Resume Downloaded notification
        try:
            from notifications.models.notification_model import Notification
            recently_downloaded = Notification.objects.filter(
                candidate_recipient=app.candidate.user,
                notification_type='RESUME_DOWNLOAD',
                related_application=app,
                created_at__gte=timezone.now() - timedelta(hours=24)
            ).exists()
            if not recently_downloaded:
                company_name = app.job.company.name if app.job and app.job.company else "A company"
                Notification.objects.create(
                    candidate_recipient=app.candidate.user,
                    notification_type='RESUME_DOWNLOAD',
                    title='Resume Viewed',
                    message=f'Your resume was viewed/downloaded by {company_name}.',
                    related_job=app.job,
                    related_application=app
                )
        except Exception as e:
            logger.warning(f"Failed to create resume download notification: {e}")

        logger.info(f"Resume viewed for application id={application_id}")
        return app
    except JobApplication.DoesNotExist:
        raise ApplicationNotFound()


def update_application_status(application_id, new_status):
    """Recruiter updates candidate status."""
    new_status = str(new_status).upper()
    valid = ['UNDER_REVIEW', 'SHORTLISTED', 'NOT_SHORTLISTED', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED']
    if new_status not in valid:
        raise InvalidStatus(f"Invalid status. Valid choices: {', '.join(valid)}")

    try:
        app = JobApplication.objects.get(id=application_id)
    except JobApplication.DoesNotExist:
        raise ApplicationNotFound()

    app.status = new_status
    update_fields = ['status', 'updated_at']

    now = timezone.now()
    if new_status == 'SHORTLISTED':
        app.shortlisted_at = now
        update_fields.append('shortlisted_at')
    elif new_status == 'NOT_SHORTLISTED':
        app.not_shortlisted_at = now
        update_fields.append('not_shortlisted_at')
    elif new_status == 'INTERVIEW':
        app.interview_at = now
        update_fields.append('interview_at')
    elif new_status == 'OFFERED':
        app.offered_at = now
        update_fields.append('offered_at')

    app.save(update_fields=update_fields)
    logger.info(f"Application id={application_id} status updated to {new_status}")

    # Add candidate notification for shortlist/not shortlist
    try:
        from notifications.models.notification_model import Notification
        company_name = app.job.company.name if app.job and app.job.company else "A company"
        job_title = app.job.title if app.job else "a job"
        
        if new_status == 'SHORTLISTED':
            Notification.objects.create(
                candidate_recipient=app.candidate.user,
                notification_type='STATUS_UPDATE',
                title='Application Shortlisted',
                message=f'Congratulations! Your application for {job_title} at {company_name} has been shortlisted.',
                related_job=app.job,
                related_application=app
            )
        elif new_status == 'NOT_SHORTLISTED':
            Notification.objects.create(
                candidate_recipient=app.candidate.user,
                notification_type='STATUS_UPDATE',
                title='Application Update',
                message=f'Your application for {job_title} at {company_name} was not shortlisted this time.',
                related_job=app.job,
                related_application=app
            )
    except Exception as e:
        logger.warning(f"Failed to create candidate notification for status {new_status}: {e}")

    BroadcastService.notify_dashboard(app.job.company_id, event_type="APPLICATION_STATUS_UPDATE")
    return app


def get_job_applications_for_recruiter(job_id, include_not_shortlisted=False):
    """Recruiter sees applications for a specific job."""
    qs = _recruiter_queryset().filter(job_id=job_id)
    if not include_not_shortlisted:
        qs = qs.exclude(status='NOT_SHORTLISTED')
    return qs.order_by('-applied_at')
