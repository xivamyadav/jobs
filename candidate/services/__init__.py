"""
Candidate Services — Re-exports for backward compatibility.
"""

from candidate.services.candidateprofile_service import (
    get_or_create_profile, get_profile, update_profile
)
from candidate.services.experience_service import (
    get_experiences, get_experience, add_experience, update_experience, delete_experience,
)
from candidate.services.education_service import (
    get_educations, get_education, add_education, update_education, delete_education,
)
from candidate.services.resume_service import (
    get_resume, upload_resume, delete_resume,
)
from candidate.services.skill_service import (
    get_skills, add_skill, remove_skill,
)
from candidate.services.job_application_service import (
    apply_to_job, list_applications, list_active_applications,
    get_application_detail, get_application_for_recruiter,
    mark_resume_viewed, update_application_status,
    get_job_applications_for_recruiter,
)
