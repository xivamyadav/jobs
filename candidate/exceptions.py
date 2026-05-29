"""
Candidate Module — Domain Exceptions.
Each exception carries an error_code for frontend programmatic handling.
"""

from rest_framework import status as http_status


class CandidateException(Exception):
    """Base exception for all candidate domain errors."""
    error_code = 'CANDIDATE_ERROR'
    status_code = http_status.HTTP_400_BAD_REQUEST

    def __init__(self, message=None):
        self.message = message or self.__class__.__doc__ or 'An error occurred.'
        super().__init__(self.message)


class CandidateNotFound(CandidateException):
    """Candidate not found."""
    error_code = 'CANDIDATE_NOT_FOUND'
    status_code = http_status.HTTP_404_NOT_FOUND


class ProfileIncomplete(CandidateException):
    """Profile completion is below the required threshold."""
    error_code = 'PROFILE_INCOMPLETE'
    status_code = http_status.HTTP_400_BAD_REQUEST


class ResumeRequired(CandidateException):
    """Please upload a resume before applying."""
    error_code = 'RESUME_REQUIRED'
    status_code = http_status.HTTP_400_BAD_REQUEST


class AlreadyApplied(CandidateException):
    """You have already applied for this job."""
    error_code = 'ALREADY_APPLIED'
    status_code = http_status.HTTP_409_CONFLICT


class ApplicationNotFound(CandidateException):
    """Application not found."""
    error_code = 'APPLICATION_NOT_FOUND'
    status_code = http_status.HTTP_404_NOT_FOUND


class ApplicationRejected(CandidateException):
    """Your application was not shortlisted. You cannot re-apply."""
    error_code = 'APPLICATION_REJECTED'
    status_code = http_status.HTTP_409_CONFLICT


class SkillAlreadyAdded(CandidateException):
    """This skill is already added to your profile."""
    error_code = 'SKILL_ALREADY_ADDED'
    status_code = http_status.HTTP_409_CONFLICT


class SkillNotFound(CandidateException):
    """Skill not found."""
    error_code = 'SKILL_NOT_FOUND'
    status_code = http_status.HTTP_404_NOT_FOUND


class InvalidFileType(CandidateException):
    """Only PDF and DOC/DOCX files are allowed."""
    error_code = 'INVALID_FILE_TYPE'
    status_code = http_status.HTTP_400_BAD_REQUEST


class FileTooLarge(CandidateException):
    """File size must be under 5MB."""
    error_code = 'FILE_TOO_LARGE'
    status_code = http_status.HTTP_400_BAD_REQUEST


class JobNotFound(CandidateException):
    """Job not found or not published."""
    error_code = 'JOB_NOT_FOUND'
    status_code = http_status.HTTP_404_NOT_FOUND


class ExperienceNotFound(CandidateException):
    """Experience record not found."""
    error_code = 'EXPERIENCE_NOT_FOUND'
    status_code = http_status.HTTP_404_NOT_FOUND


class EducationNotFound(CandidateException):
    """Education record not found."""
    error_code = 'EDUCATION_NOT_FOUND'
    status_code = http_status.HTTP_404_NOT_FOUND


class InvalidStatus(CandidateException):
    """Invalid application status."""
    error_code = 'INVALID_STATUS'
    status_code = http_status.HTTP_400_BAD_REQUEST
