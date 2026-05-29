"""Skill Service — Add/remove skills from candidate profile."""

import logging
from candidate.models.skill import CandidateSkill
from candidate.services.candidateprofile_service import get_or_create_profile
from candidate.exceptions import SkillAlreadyAdded, SkillNotFound
from enterprise.models.skill import Skill

logger = logging.getLogger(__name__)


def get_skills(user):
    profile = get_or_create_profile(user)
    return CandidateSkill.objects.filter(candidate=profile).select_related('skill')


def add_skill(user, skill_id=None, name=None, proficiency=None, years_experience=None, is_primary=False):
    profile = get_or_create_profile(user)
    
    if skill_id:
        try:
            skill = Skill.objects.get(skill_id=skill_id)
        except Skill.DoesNotExist:
            raise SkillNotFound("Skill not found in master table.")
    elif name:
        skill, _ = Skill.objects.get_or_create(skill_name=name)
    else:
        raise SkillNotFound("Provide either skill_id or name.")

    if CandidateSkill.objects.filter(candidate=profile, skill=skill).exists():
        raise SkillAlreadyAdded()

    cs = CandidateSkill.objects.create(
        candidate=profile,
        skill=skill,
        proficiency=proficiency,
        years_experience=years_experience,
        is_primary=is_primary
    )
    logger.info(f"Added skill id={skill.skill_id} for user_id={user.id}")
    return cs


def remove_skill(user, skill_mapping_id):
    profile = get_or_create_profile(user)
    try:
        skill = CandidateSkill.objects.get(id=skill_mapping_id, candidate=profile)
        skill_id = skill.id
        skill.delete()
        logger.info(f"Removed skill mapping id={skill_id} for user_id={user.id}")
    except CandidateSkill.DoesNotExist:
        raise SkillNotFound("Skill not found in your profile.")
