"""
Education — Candidate education records.

Schema decisions:
  - level uses TextChoices enum for type safety.
  - Updated timestamps for auditing.
  - Validation: end_year >= start_year enforced at model level.
"""

from django.db import models
from .candidateprofile import CandidateProfile


class Education(models.Model):

    class Level(models.TextChoices):
        SECONDARY = 'SECONDARY', 'Secondary (10th)'
        SENIOR_SECONDARY = 'SENIOR_SECONDARY', 'Senior Secondary (12th)'
        DIPLOMA = 'DIPLOMA', 'Diploma'
        BACHELORS = 'BACHELORS', 'Bachelor\'s Degree'
        MASTERS = 'MASTERS', 'Master\'s Degree'
        PHD = 'PHD', 'PhD / Doctorate'
        CERTIFICATION = 'CERTIFICATION', 'Certification / Course'

    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='educations'
    )

    level = models.CharField(max_length=20, choices=Level.choices)
    institution = models.CharField(max_length=255)
    degree = models.CharField(max_length=255, blank=True, default='')
    field_of_study = models.CharField(max_length=255, blank=True, default='')
    start_year = models.PositiveSmallIntegerField(null=True, blank=True)
    end_year = models.PositiveSmallIntegerField(null=True, blank=True)
    grade = models.CharField(max_length=50, blank=True, default='', help_text='CGPA or percentage')
    description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'candidate_education'
        ordering = ['-end_year', '-start_year']
        indexes = [
            models.Index(fields=['candidate'], name='idx_edu_candidate'),
            models.Index(fields=['level'], name='idx_edu_level'),
        ]

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.start_year and self.end_year:
            if self.end_year < self.start_year:
                raise ValidationError("end_year cannot be before start_year.")

    def __str__(self):
        return f"{self.level} - {self.institution}"
