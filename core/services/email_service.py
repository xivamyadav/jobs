"""
Utility service for sending outbound emails via SMTP.
"""

from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """
    Handles all outbound email communications (verifications, password resets).
    """

    @staticmethod
    def send_plain_email(subject: str, message: str, recipient_list: list) -> bool:
        """
        Sends a standard plaintext email using Django's SMTP configuration.
        """
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=recipient_list,
                fail_silently=False,
            )
            return True
        except Exception as e:
            logger.error(f"Email failed to send to {recipient_list}: {str(e)}")
            return False