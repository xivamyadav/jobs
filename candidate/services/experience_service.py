"""Experience Service — CRUD for candidate work experience."""

import logging
from candidate.models.experience import Experience
from candidate.services.candidateprofile_service import get_or_create_profile
from candidate.exceptions import ExperienceNotFound

logger = logging.getLogger(__name__)


def get_experiences(user):
    profile = get_or_create_profile(user)
    return Experience.objects.filter(candidate=profile).order_by('-start_date')


def get_experience(user, experience_id):
    profile = get_or_create_profile(user)
    try:
        return Experience.objects.get(id=experience_id, candidate=profile)
    except Experience.DoesNotExist:
        raise ExperienceNotFound()


def add_experience(user, data):
    profile = get_or_create_profile(user)
    exp = Experience(candidate=profile, **data)
    exp.full_clean()
    exp.save()
    logger.info(f"Added experience id={exp.id} for user_id={user.id}")
    return exp


def update_experience(user, experience_id, data):
    exp = get_experience(user, experience_id)
    update_fields = []
    for attr, value in data.items():
        if getattr(exp, attr, None) != value:
            setattr(exp, attr, value)
            update_fields.append(attr)
    if update_fields:
        exp.full_clean()
        exp.save(update_fields=update_fields)
        logger.info(f"Updated experience id={exp.id} fields={update_fields}")
    return exp


def delete_experience(user, experience_id):
    exp = get_experience(user, experience_id)
    exp_id = exp.id
    exp.delete()
    logger.info(f"Deleted experience id={exp_id} for user_id={user.id}")
