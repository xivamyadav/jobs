"""
Candidate URL Configuration — Same URL patterns, updated imports from split view files.
"""

from django.urls import path
from candidate.views.profile_views import ProfileView
from candidate.views.experience_views import ExperienceListView, ExperienceDetailView
from candidate.views.education_views import EducationListView, EducationDetailView
from candidate.views.resume_views import ResumeView
from candidate.views.skill_views import SkillListView, SkillDetailView
from candidate.views.job_application_views import JobApplicationListView, JobApplicationDetailView, JobApplyView
from candidate.views.job_browse_views import CandidateJobBrowseView, CandidateJobDetailView, SavedJobListView, SaveJobView, CandidateCompanyDetailView
from candidate.views.certification_views import CertificationListView, CertificationDetailView
from candidate.views.insights_views import CandidateInsightsView

urlpatterns = [
    path('profile/',                    ProfileView.as_view(),                name='candidate-profile'),           # GET | PATCH
    path('experience/',                 ExperienceListView.as_view(),          name='candidate-experience-list'),   # GET | POST
    path('experience/<int:pk>/',        ExperienceDetailView.as_view(),        name='candidate-experience-detail'), # GET | PATCH | DELETE
    path('education/',                  EducationListView.as_view(),           name='candidate-education-list'),    # GET | POST
    path('education/<int:pk>/',         EducationDetailView.as_view(),         name='candidate-education-detail'),  # GET | PATCH | DELETE
    path('certifications/',             CertificationListView.as_view(),       name='candidate-certification-list'),# GET | POST
    path('certifications/<int:pk>/',    CertificationDetailView.as_view(),     name='candidate-certification-detail'),# GET | PATCH | DELETE
    path('resume/',                     ResumeView.as_view(),                  name='candidate-resume'),            # GET | POST | DELETE
    path('skills/',                     SkillListView.as_view(),               name='candidate-skill-list'),        # GET | POST
    path('skills/<int:pk>/',            SkillDetailView.as_view(),             name='candidate-skill-detail'),      # DELETE
    path('applications/',               JobApplicationListView.as_view(),      name='candidate-applications'),      # GET ?filter=active|all
    path('applications/<int:pk>/',      JobApplicationDetailView.as_view(),    name='candidate-application-detail'),# GET
    path('jobs/browse/',                CandidateJobBrowseView.as_view(),      name='candidate-jobs-browse'),       # GET ?search=keyword
    path('jobs/<int:job_id>/',          CandidateJobDetailView.as_view(),      name='candidate-job-detail'),        # GET
    path('jobs/<int:job_id>/apply/',    JobApplyView.as_view(),                name='candidate-job-apply'),         # POST
    path('jobs/saved/',                 SavedJobListView.as_view(),            name='candidate-saved-jobs'),        # GET
    path('jobs/<int:job_id>/save/',     SaveJobView.as_view(),                 name='candidate-save-job'),          # POST | DELETE
    path('company/<int:pk>/',           CandidateCompanyDetailView.as_view(),  name='candidate-company-detail'),    # GET
    path('insights/',                   CandidateInsightsView.as_view(),       name='candidate-insights'),          # GET
]
