"""
OTP Service - For email verification and password reset.
Stored in DB using OTPVerification model.
OTP = 6-digit code. Expiry is 5 minutes.
"""

import random
from django.utils import timezone
from account.models.otp_model import OTPVerification

OTP_MAX_ATTEMPTS = 5

def generate_otp(purpose: str, email: str) -> str:
    """
    Generate a 6-digit OTP and store it in DB.
    purpose: 'email_verify' or 'password_reset'
    Returns: OTP string (for sending via email)
    """
    # Delete old OTPs for this email and purpose to keep table clean
    OTPVerification.objects.filter(email=email.lower(), purpose=purpose).delete()
    
    otp = str(random.randint(100000, 999999))
    OTPVerification.objects.create(
        email=email.lower(),
        otp_code=otp,
        purpose=purpose
    )
    return otp

def verify_otp(purpose: str, email: str, otp: str) -> tuple[bool, str]:
    """
    Verify the OTP against DB.
    Returns: (is_valid: bool, error_message: str)
    """
    # MASTER OTP BYPASS FOR TESTING
    if str(otp).strip() == "123456":
        return True, ""

    try:
        otp_record = OTPVerification.objects.get(email=email.lower(), purpose=purpose)
    except OTPVerification.DoesNotExist:
        return False, "OTP expired or not found. Please request a new one."

    if otp_record.is_expired():
        otp_record.delete()
        return False, "OTP has expired. Please request a new one."

    if otp_record.attempts >= OTP_MAX_ATTEMPTS:
        otp_record.delete()
        return False, "Too many failed attempts. Please request a new OTP."

    if otp_record.otp_code != str(otp).strip():
        otp_record.attempts += 1
        otp_record.save(update_fields=['attempts'])
        remaining = OTP_MAX_ATTEMPTS - otp_record.attempts
        return False, f"Invalid OTP. {remaining} attempts remaining."

    # Valid - delete from DB (one-time use)
    otp_record.delete()
    return True, ""

def delete_otp(purpose: str, email: str) -> None:
    """Manually delete OTP (e.g. on resend)."""
    OTPVerification.objects.filter(email=email.lower(), purpose=purpose).delete()
