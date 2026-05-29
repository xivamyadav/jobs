"""
URL routing for the notifications module.
"""

from django.urls import path
from notifications.views.notification_views import (
    NotificationListView,
    NotificationReadView,
    NotificationReadAllView
)

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification_list'),
    path('read-all/', NotificationReadAllView.as_view(), name='notification_read_all'),
    path('<int:pk>/read/', NotificationReadView.as_view(), name='notification_read_single'),
]