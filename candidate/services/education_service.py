"""Education Service — CRUD for candidate education records."""

import logging
from candidate.models.education import Education
from candidate.services.candidateprofile_service import get_or_create_profile
from candidate.exceptions import EducationNotFound

logger = logging.getLogger(__name__)


def get_educations(user):
    profile = get_or_create_profile(user)
    return Education.objects.filter(candidate=profile).order_by('-start_year')


def get_education(user, education_id):
    profile = get_or_create_profile(user)
    try:
        return Education.objects.get(id=education_id, candidate=profile)
    except Education.DoesNotExist:
        raise EducationNotFound()


def add_education(user, data):
    profile = get_or_create_profile(user)
    edu = Education(candidate=profile, **data)
    edu.full_clean()
    edu.save()
    logger.info(f"Added education id={edu.id} for user_id={user.id}")
    return edu


def update_education(user, education_id, data):
    edu = get_education(user, education_id)
    update_fields = []
    for attr, value in data.items():
        if getattr(edu, attr, None) != value:
            setattr(edu, attr, value)
            update_fields.append(attr)
    if update_fields:
        edu.full_clean()
        edu.save(update_fields=update_fields)
        logger.info(f"Updated education id={edu.id} fields={update_fields}")
    return edu


def delete_education(user, education_id):
    edu = get_education(user, education_id)
    edu_id = edu.id
    edu.delete()
    logger.info(f"Deleted education id={edu_id} for user_id={user.id}")
