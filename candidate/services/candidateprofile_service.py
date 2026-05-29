"""
Candidate Profile Service — Profile CRUD + completion score.
Optimized: select_related on every query, logging, proper defaults.
"""

import logging
from candidate.models.candidateprofile import CandidateProfile
from enterprise.models.location import Location

logger = logging.getLogger(__name__)


def get_or_create_profile(user):
    """
    user = CandidateUser instance.
    Uses select_related('user') to avoid N+1 on serializer access.
    """
    profile, created = CandidateProfile.objects.select_related(
        'user', 'location'
    ).get_or_create(
        user=user,
        defaults={
            'full_name': user.full_name or user.email.split('@')[0],
        }
    )
    if created:
        logger.info(f"Created CandidateProfile for user_id={user.id} email={user.email}")
    return profile


def get_profile(user):
    """Get profile with all related lookups pre-loaded."""
    try:
        return CandidateProfile.objects.select_related(
            'user', 'location', 'location__state', 'location__country',
        ).get(user=user)
    except CandidateProfile.DoesNotExist:
        return None


def update_profile(user, validated_data):
    """
    Update candidate profile.
    phone_number goes to CandidateUser, rest to CandidateProfile.
    Location is updated via location_id only.
    """
    profile = get_or_create_profile(user)

    # Handle phone_number → goes to CandidateUser, not profile
    phone_number = validated_data.pop('phone_number', None)
    if phone_number is not None:
        user.phone_number = phone_number
        user.save(update_fields=['phone_number'])
        logger.info(f"Updated phone for user_id={user.id}")

    location_id = validated_data.pop('location_id', -1)

    if location_id != -1:
        if location_id is None:
            profile.location = None
        else:
            try:
                location_obj = Location.objects.select_related('state', 'country').get(id=location_id)
                profile.location = location_obj
            except Location.DoesNotExist:
                logger.warning(f"Location id={location_id} not found for user_id={user.id}")

    update_fields = []
    for attr, value in validated_data.items():
        if getattr(profile, attr, None) != value:
            setattr(profile, attr, value)
            update_fields.append(attr)

    if location_id != -1:
        update_fields.append('location')

    if update_fields:
        profile.save(update_fields=update_fields + ['updated_at'])
        logger.info(f"Updated profile user_id={user.id} fields={update_fields}")

    profile.refresh_from_db()
    return profile
