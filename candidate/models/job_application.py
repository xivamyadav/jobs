"""
JobApplication — Naukri-style application tracking.

Schema decisions:
  - Status flow: APPLIED → RESUME_VIEWED → UNDER_REVIEW → SHORTLISTED/NOT_SHORTLISTED → INTERVIEW → OFFERED → HIRED/REJECTED
  - unique_together prevents duplicate applications.
  - Timestamp columns for each status change enables timeline tracking.
  - recruiter_notes is internal-only (never exposed to candidate).
"""

from django.db import models
from .candidateprofile import CandidateProfile
from .resume import Resume
from jobs.models.job_model import Job


class JobApplication(models.Model):

    class Status(models.TextChoices):
        APPLIED = 'APPLIED', 'Applied'
        RESUME_VIEWED = 'RESUME_VIEWED', 'Resume Viewed'
        UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
        SHORTLISTED = 'SHORTLISTED', 'Shortlisted'
        NOT_SHORTLISTED = 'NOT_SHORTLISTED', 'Not Shortlisted'
        INTERVIEW = 'INTERVIEW', 'Interview Scheduled'
        OFFERED = 'OFFERED', 'Offer Extended'
        HIRED = 'HIRED', 'Hired'
        REJECTED = 'REJECTED', 'Rejected'

    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='job_applications'
    )
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='candidate_applications'
    )
    resume = models.ForeignKey(
        Resume,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='job_applications'
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default='APPLIED'
    )
    cover_letter = models.TextField(blank=True, default='')
    expected_salary = models.PositiveIntegerField(null=True, blank=True)
    notice_period = models.PositiveSmallIntegerField(null=True, blank=True)

    # Recruiter-only internal notes (never exposed to candidate)
    recruiter_notes = models.TextField(blank=True, default='')

    # Naukri-style tracking timestamps
    resume_viewed_at = models.DateTimeField(null=True, blank=True)
    shortlisted_at = models.DateTimeField(null=True, blank=True)
    not_shortlisted_at = models.DateTimeField(null=True, blank=True)
    interview_at = models.DateTimeField(null=True, blank=True)
    offered_at = models.DateTimeField(null=True, blank=True)

    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'candidate_jobapplication'
        unique_together = ('candidate', 'job')
        ordering = ['-applied_at']
        indexes = [
            models.Index(fields=['candidate'], name='idx_app_candidate'),
            models.Index(fields=['job'], name='idx_app_job'),
            models.Index(fields=['status'], name='idx_app_status'),
            models.Index(fields=['job', 'status'], name='idx_app_job_status'),
            models.Index(fields=['applied_at'], name='idx_app_date'),
        ]

    def __str__(self):
        return f"{self.candidate.full_name} - {self.job.title} [{self.status}]"
