"""
Resume — Candidate resume file storage.

Schema decisions:
  - OneToOneField to CandidateProfile: max 1 active resume per candidate.
  - file_url removed: Django FileField auto-generates URL via .url property.
    Serializer builds absolute URL using request context.
  - is_active default=True (upload automatically activates).
"""

import os
import uuid
from django.db import models
from .candidateprofile import CandidateProfile


def resume_upload_path(instance, filename):
    """
    resumes/user_<id>/<uuid>.<ext>
    Prevents filename conflicts. Original name preserved in file_name field.
    """
    ext = os.path.splitext(filename)[1]
    unique_name = f"{uuid.uuid4().hex}{ext}"
    return f"resumes/user_{instance.candidate.user_id}/{unique_name}"


class Resume(models.Model):
    candidate = models.OneToOneField(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='resume'
    )

    resume_file = models.FileField(upload_to=resume_upload_path)

    # Original filename — what the user sees ("My_Resume.pdf")
    file_name = models.CharField(max_length=255)
    file_mime = models.CharField(max_length=100, default='application/pdf')
    file_size_bytes = models.PositiveBigIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'candidate_resume'
        indexes = [
            models.Index(fields=['candidate'], name='idx_resume_candidate'),
        ]

    def __str__(self):
        return f"{self.candidate.full_name} — {self.file_name}"
