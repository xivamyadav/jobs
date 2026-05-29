"""
SavedJob — Candidate bookmarks jobs for later.
"""

from django.db import models
from candidate.models.candidateprofile import CandidateProfile
from jobs.models.job_model import Job


class SavedJob(models.Model):
    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='saved_jobs'
    )
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='saved_by_candidates'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'candidate_savedjob'
        unique_together = ('candidate', 'job')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['candidate'], name='idx_saved_candidate'),
        ]

    def __str__(self):
        return f"{self.candidate.full_name} saved {self.job.title}"
