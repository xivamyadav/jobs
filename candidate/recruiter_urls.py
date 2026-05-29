from django.urls import path
from candidate.views.recruiter_views import (
    RecruiterApplicationListView,
    RecruiterApplicationDetailView,
    RecruiterViewResumeAPI,
    RecruiterUpdateStatusView,
    RecruiterAddNotesView,
)

urlpatterns = [
    path('job-applicants/<int:job_id>/',   RecruiterApplicationListView.as_view(),   name='recruiter-job-applications'), # GET ?show_all=true
    path('application/<int:pk>/',          RecruiterApplicationDetailView.as_view(), name='recruiter-application-detail'), # GET (full candidate profile + skills)
    path('resume/<int:pk>/',               RecruiterViewResumeAPI.as_view(),          name='recruiter-view-resume'),       # POST (marks RESUME_VIEWED, returns file URL)
    path('application-status/<int:pk>/',   RecruiterUpdateStatusView.as_view(),       name='recruiter-update-status'),     # PATCH: { status: SHORTLISTED|NOT_SHORTLISTED|UNDER_REVIEW }
    path('application-notes/<int:pk>/',    RecruiterAddNotesView.as_view(),           name='recruiter-add-notes'),         # PATCH: { employer_notes: "..." }
]
