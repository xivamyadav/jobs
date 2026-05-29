"""
Main URL Configuration - ByTeBuZz Backend.

API Structure:
  /api/v1/auth/candidate/ → Candidate Auth (register, login, OTP, password)
  /api/v1/auth/company/   → Company Auth (register, login, OTP, password)
  /api/v1/company/        → Company profile
  /api/v1/jobs/           → Job CRUD
  /api/v1/notifications/  → Notifications
  /api/v1/dashboard/      → Dashboard stats
  /api/v1/candidate/      → Candidate profile, applications, browse
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # ── AUTH (Completely Separate) ──
    path('api/v1/auth/candidate/', include('candidate.auth_urls')),  # Candidate register/login/OTP/password
    path('api/v1/auth/company/',   include('company.auth_urls')),    # Company register/login/OTP/password

    # ── APP APIs ──
    path('api/v1/company/',        include('company.urls')),
    path('api/v1/jobs/',           include('jobs.urls')),
    path('api/v1/notifications/',  include('notifications.urls')),
    path('api/v1/dashboard/',      include('dashboard.urls')),
    path('api/v1/',                include('enterprise.urls')),       # Skills, Locations, Cities
    path('api/v1/candidate/',      include('candidate.urls')),       # Candidate profile, applications
    path('api/v1/',                include('candidate.recruiter_urls')), # Recruiter applicant management
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
