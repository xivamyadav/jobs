from django.db import models
from django.contrib.auth import get_user_model
from core.models import TimeStampedModel

User = get_user_model()

class Notification(TimeStampedModel):
    NOTIFICATION_TYPES = [
        ('NEW_APPLICATION', 'New Application'),
        ('STATUS_UPDATE', 'Status Update'),
        ('EXPIRING_SOON', 'Expiring Soon'),
        ('SYSTEM', 'System'),
        ('PROFILE_VIEW', 'Profile Viewed'),
        ('RESUME_DOWNLOAD', 'Resume Downloaded'),
    ]

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='legacy_notifications', null=True, blank=True)
    candidate_recipient = models.ForeignKey('candidate.CandidateUser', on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    company_recipient = models.ForeignKey('company.CompanyUser', on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # Reference
    related_job = models.ForeignKey('jobs.Job', on_delete=models.SET_NULL, null=True, blank=True)
    related_application = models.ForeignKey('candidate.JobApplication', on_delete=models.SET_NULL, null=True, blank=True)
    
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.recipient.email}"