"""
CandidateSkill — Mapping table between CandidateProfile and enterprise Skill master.

Schema decisions:
  - unique_together enforces 1 entry per skill per candidate.
  - RESTRICT on skill FK prevents deleting master skills that candidates have.
  - Added created_at for auditing.
"""

from django.db import models
from enterprise.models.skill import Skill
from candidate.models.candidateprofile import CandidateProfile


class CandidateSkill(models.Model):
    class Proficiency(models.TextChoices):
        BEGINNER = 'BEGINNER', 'Beginner'
        INTERMEDIATE = 'INTERMEDIATE', 'Intermediate'
        ADVANCED = 'ADVANCED', 'Advanced'
        EXPERT = 'EXPERT', 'Expert'

    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='candidate_skills'
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.RESTRICT,
        related_name='candidate_skills'
    )
    proficiency = models.CharField(
        max_length=15,
        choices=Proficiency.choices,
        default='INTERMEDIATE'
    )
    years_experience = models.DecimalField(
        max_digits=4, decimal_places=1, null=True, blank=True
    )
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'candidate_candidateskill'
        unique_together = ('candidate', 'skill')
        indexes = [
            models.Index(fields=['skill'], name='idx_cskill_skill'),
            models.Index(fields=['is_primary'], name='idx_cskill_primary'),
            models.Index(fields=['candidate', 'is_primary'], name='idx_cskill_cand_primary'),
        ]

    def __str__(self):
        return f"{self.candidate} — {self.skill}"
