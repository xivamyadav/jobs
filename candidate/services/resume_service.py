"""Resume Service — Upload, retrieve, delete candidate resume."""

import logging
from candidate.models.resume import Resume
from candidate.services.candidateprofile_service import get_or_create_profile
from candidate.exceptions import FileTooLarge, InvalidFileType

logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]


def get_resume(user):
    profile = get_or_create_profile(user)
    try:
        return profile.resume
    except Resume.DoesNotExist:
        return None


def upload_resume(user, resume_file):
    """Upload or replace candidate resume. Validates size and type."""
    profile = get_or_create_profile(user)

    # Validation
    if resume_file.size > MAX_FILE_SIZE:
        raise FileTooLarge()
    if resume_file.content_type not in ALLOWED_MIME_TYPES:
        raise InvalidFileType()

    try:
        resume = profile.resume
        # Delete old file AFTER validation passes (atomic intent)
        if resume.resume_file:
            old_path = resume.resume_file.name
            resume.resume_file.delete(save=False)
            logger.info(f"Deleted old resume file={old_path} for user_id={user.id}")
    except Resume.DoesNotExist:
        resume = Resume(candidate=profile)

    resume.resume_file = resume_file
    resume.file_name = resume_file.name
    resume.file_mime = resume_file.content_type
    resume.file_size_bytes = resume_file.size
    resume.is_active = True
    resume.save()

    logger.info(f"Uploaded resume id={resume.id} file={resume_file.name} size={resume_file.size} for user_id={user.id}")
    return resume


def delete_resume(user):
    resume = get_resume(user)
    if resume:
        if resume.resume_file:
            resume.resume_file.delete()
        resume_id = resume.id
        resume.delete()
        logger.info(f"Deleted resume id={resume_id} for user_id={user.id}")
