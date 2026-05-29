"""
Business logic layer for generating and managing notifications.
"""

from django.db.models import QuerySet
from django.utils import timezone
from notifications.models.notification_model import Notification


class NotificationService:
    
    @staticmethod
    def get_user_notifications(user) -> QuerySet:
        """
        Retrieves all active notifications for a specific user.
        """
        from candidate.models.candidate_user import CandidateUser
        from company.models.company_user import CompanyUser
        
        if isinstance(user, CandidateUser):
            return Notification.objects.filter(candidate_recipient=user)
        elif isinstance(user, CompanyUser):
            return Notification.objects.filter(company_recipient=user)
        return Notification.objects.filter(recipient=user)

    @staticmethod
    def mark_as_read(notification_id: int, user) -> Notification:
        """
        Marks a specific notification as read, ensuring it belongs to the user requesting it.
        """
        from candidate.models.candidate_user import CandidateUser
        from company.models.company_user import CompanyUser
        
        try:
            if isinstance(user, CandidateUser):
                notification = Notification.objects.get(id=notification_id, candidate_recipient=user)
            elif isinstance(user, CompanyUser):
                notification = Notification.objects.get(id=notification_id, company_recipient=user)
            else:
                notification = Notification.objects.get(id=notification_id, recipient=user)
                
            if not notification.is_read:
                notification.is_read = True
                notification.read_at = timezone.now()
                notification.save(update_fields=['is_read', 'read_at', 'updated_at'])
            return notification
        except Notification.DoesNotExist:
            raise ValueError("Notification not found or does not belong to the user.")

    @staticmethod
    def mark_all_as_read(user) -> int:
        """
        Bulk updates all unread notifications for a user to 'read'.
        Returns the number of updated records.
        """
        from candidate.models.candidate_user import CandidateUser
        from company.models.company_user import CompanyUser
        
        if isinstance(user, CandidateUser):
            return Notification.objects.filter(candidate_recipient=user, is_read=False).update(is_read=True)
        elif isinstance(user, CompanyUser):
            return Notification.objects.filter(company_recipient=user, is_read=False).update(is_read=True)
        return Notification.objects.filter(recipient=user, is_read=False).update(is_read=True)

    @staticmethod
    def create_system_notification(user, n_type: str, message: str, sub_text: str = None, link: str = None) -> Notification:
        """
        Utility method to be called by OTHER modules (like 'applicants' or 'jobs')
        to trigger a new notification securely.
        """
        from candidate.models.candidate_user import CandidateUser
        from company.models.company_user import CompanyUser
        
        notification = Notification(
            notification_type=n_type,
            title=sub_text or n_type.replace('_', ' ').title(),
            message=message,
        )
        
        if isinstance(user, CandidateUser):
            notification.candidate_recipient = user
        elif isinstance(user, CompanyUser):
            notification.company_recipient = user
        else:
            notification.recipient = user
            
        notification.save()
        return notification