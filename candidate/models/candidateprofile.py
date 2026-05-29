"""
CandidateProfile — Extended profile data for candidates.

Schema decisions:
  - full_name lives here (editable by candidate) AND on CandidateUser (set at signup).
    Profile full_name is the "display name" — what recruiters see.
    CandidateUser.full_name is the "account name" — rarely shown.
  - primary_phone removed: phone_number already exists on CandidateUser.
    Serializer pulls it from user.phone_number.
  - Salary stored as DecimalField for precision (LPA like 4.5, 12.75).
  - profile_completion_score is denormalized for fast filtering.
"""

from django.db import models
from candidate.models.candidate_user import CandidateUser
from enterprise.models.location import Location


class CandidateProfile(models.Model):

    class Gender(models.TextChoices):
        MALE = 'MALE', 'Male'
        FEMALE = 'FEMALE', 'Female'
        OTHER = 'OTHER', 'Other'
        PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY', 'Prefer not to say'

    user = models.OneToOneField(
        CandidateUser,
        on_delete=models.CASCADE,
        related_name='candidate_profile'
    )

    # ── Personal Info ─────────────────────────────────────────────────────
    full_name = models.CharField(max_length=200)
    headline = models.CharField(
        max_length=300, blank=True, default='',
        help_text='Short tagline: "Senior Python Developer | 5 yrs exp"'
    )
    about = models.TextField(
        blank=True, default='',
        help_text='Detailed bio / summary for the profile.'
    )
    gender = models.CharField(
        max_length=20, choices=Gender.choices,
        null=True, blank=True
    )
    date_of_birth = models.DateField(null=True, blank=True)
    profile_picture = models.ImageField(
        upload_to='candidate_profiles/',
        null=True, blank=True,
        help_text='Uploaded profile picture.'
    )

    # ── Location ──────────────────────────────────────────────────────────
    location = models.ForeignKey(
        Location,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='candidate_profiles'
    )

    # ── Professional Info ─────────────────────────────────────────────────
    is_fresher = models.BooleanField(
        default=False,
        help_text='True if candidate has no work experience (fresher).'
    )
    current_designation = models.CharField(max_length=200, blank=True, default='')
    total_experience_years = models.PositiveIntegerField(default=0)
    total_experience_months = models.PositiveIntegerField(default=0)
    current_salary_lpa = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True,
        help_text='Current salary in LPA (e.g. 4.50, 12.00).'
    )
    expected_salary_lpa = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True,
        help_text='Expected salary in LPA (e.g. 8.00, 15.50).'
    )
    notice_period_days = models.PositiveSmallIntegerField(null=True, blank=True)

    # ── Timestamps ────────────────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'candidate_candidateprofile'
        indexes = [
            models.Index(fields=['total_experience_years', 'total_experience_months'], name='idx_cand_exp'),
            models.Index(fields=['expected_salary_lpa'], name='idx_cand_salary'),
            models.Index(fields=['notice_period_days'], name='idx_cand_notice'),
            models.Index(fields=['location'], name='idx_cand_location'),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.user.email})"

    # ── Derived properties (no extra DB column needed) ────────────────────
    @property
    def city(self):
        return self.location.city if self.location else None

    @property
    def state(self):
        return self.location.state if self.location else None

    @property
    def country(self):
        return self.location.country if self.location else None

    @property
    def state_name(self):
        return self.location.state.name if self.location and self.location.state else None

    @property
    def country_name(self):
        return self.location.country.name if self.location and self.location.country else None
