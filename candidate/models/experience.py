"""
Experience — Candidate work experience records.

Schema decisions:
  - is_current is a non-nullable BooleanField (default=False). Nulls on booleans
    cause 3-state logic bugs (True/False/None).
  - Updated timestamps added for auditing.
"""

from django.db import models
from .candidateprofile import CandidateProfile


class Experience(models.Model):

    class EmploymentType(models.TextChoices):
        FULL_TIME = 'FULL_TIME', 'Full Time'
        PART_TIME = 'PART_TIME', 'Part Time'
        CONTRACT = 'CONTRACT', 'Contract'
        INTERNSHIP = 'INTERNSHIP', 'Internship'
        FREELANCE = 'FREELANCE', 'Freelance'

    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='candidate_experiences'
    )
    company_name_text = models.CharField(max_length=255, help_text='Free text company name')
    designation = models.CharField(max_length=200)
    employment_type = models.CharField(
        max_length=20,
        choices=EmploymentType.choices,
        default='FULL_TIME'
    )
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    location = models.ForeignKey('enterprise.Location', on_delete=models.SET_NULL, null=True, blank=True, related_name='candidate_experiences')
    description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'candidate_experience'
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['candidate'], name='idx_exp_candidate'),
            models.Index(fields=['candidate', 'is_current'], name='idx_exp_cand_current'),
        ]

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.is_current and self.end_date is not None:
            raise ValidationError("Current job cannot have an end date.")
        if not self.is_current and self.end_date is None:
            raise ValidationError("Past job must have an end date.")

    def __str__(self):
        return f"{self.designation} at {self.company_name_text}"
