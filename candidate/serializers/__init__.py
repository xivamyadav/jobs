"""
Candidate Serializers — Re-exports for backward compatibility.
All serializers are split into domain-specific files.
"""

from candidate.serializers.profile_serializers import (
    CandidateProfileSerializer,
    CandidateProfileUpdateSerializer,
)
from candidate.serializers.experience_serializers import ExperienceSerializer
from candidate.serializers.education_serializers import EducationSerializer
from candidate.serializers.resume_serializers import ResumeSerializer
from candidate.serializers.skill_serializers import CandidateSkillSerializer
from candidate.serializers.job_serializers import (
    JobApplicationSerializer,
    SavedJobSerializer,
)
from candidate.serializers.certification_serializers import CertificationSerializer

__all__ = [
    'CandidateProfileSerializer',
    'CandidateProfileUpdateSerializer',
    'ExperienceSerializer',
    'EducationSerializer',
    'ResumeSerializer',
    'CandidateSkillSerializer',
    'JobApplicationSerializer',
    'SavedJobSerializer',
    'CertificationSerializer',
]
