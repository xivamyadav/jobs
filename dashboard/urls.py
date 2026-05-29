"""
URL configuration for dashboard endpoints.
"""

from django.urls import path
from dashboard.views import get_dashboard_stats

urlpatterns = [
    path('stats/', get_dashboard_stats, name='dashboard_stats'),
]