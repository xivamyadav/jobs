"""
Email Service - Sending OTP emails and password reset emails.
With clean HTML templates.
"""

from django.conf import settings
from django.core.mail import EmailMultiAlternatives


def _send_email(to_email: str, subject: str, text_body: str, html_body: str) -> None:
    """Base email sender."""
    email = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[to_email],
    )
    email.attach_alternative(html_body, "text/html")
    email.send(fail_silently=False)


def send_email_verification_otp(to_email: str, full_name: str, otp: str) -> None:
    """
    Send email verification OTP - after registration.
    """
    subject = "Verify your ByTeBuZz email - OTP"

    text_body = (
        f"Hi {full_name},\n\n"
        f"Your email verification OTP is: {otp}\n\n"
        f"This OTP expires in 10 minutes.\n"
        f"Do not share this OTP with anyone.\n\n"
        f"If you did not register, ignore this email."
    )

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Hi <strong>{full_name}</strong>,</p>
        <p>Use the OTP below to verify your email address:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 6px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2d6cdf;">{otp}</span>
        </div>
        <p style="color: #666; font-size: 14px;">This OTP expires in <strong>10 minutes</strong>.</p>
        <p style="color: #999; font-size: 12px;">If you did not register on ByTeBuZz, please ignore this email.</p>
    </div>
    """

    _send_email(to_email, subject, text_body, html_body)


def send_email_verification_link(to_email: str, full_name: str, verification_link: str) -> None:
    """
    Send email verification link - after registration.
    """
    subject = "Verify your ByTeBuZz email"

    text_body = (
        f"Hi {full_name},\n\n"
        f"Please click the link below to verify your email address:\n"
        f"{verification_link}\n\n"
        f"If you did not register, ignore this email."
    )

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Hi <strong>{full_name}</strong>,</p>
        <p>Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{verification_link}" style="background-color: #2d6cdf; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email</a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; font-size: 12px; color: #2d6cdf;">{verification_link}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">If you did not register on ByTeBuZz, please ignore this email.</p>
    </div>
    """

    _send_email(to_email, subject, text_body, html_body)


def send_password_reset_otp(to_email: str, full_name: str, otp: str) -> None:
    """
    Send password reset OTP.
    """
    subject = "Reset your ByTeBuZz password - OTP"

    text_body = (
        f"Hi {full_name},\n\n"
        f"Your password reset OTP is: {otp}\n\n"
        f"This OTP expires in 10 minutes.\n"
        f"Do not share this OTP with anyone.\n\n"
        f"If you did not request this, ignore this email."
    )

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333;">Password Reset</h2>
        <p>Hi <strong>{full_name}</strong>,</p>
        <p>Use the OTP below to reset your password:</p>
        <div style="background: #fff3cd; padding: 20px; text-align: center; border-radius: 6px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #856404;">{otp}</span>
        </div>
        <p style="color: #666; font-size: 14px;">This OTP expires in <strong>10 minutes</strong>.</p>
        <p style="color: #dc3545; font-size: 13px;"><strong>Security:</strong> Never share this OTP with anyone.</p>
        <p style="color: #999; font-size: 12px;">If you did not request a password reset, please ignore this email.</p>
    </div>
    """

    _send_email(to_email, subject, text_body, html_body)


def send_password_changed_email(to_email: str, full_name: str) -> None:
    """
    Send confirmation email after password change.
    """
    subject = "Your ByTeBuZz password was changed"

    text_body = (
        f"Hi {full_name},\n\n"
        f"Your ByTeBuZz account password was changed successfully.\n"
        f"If this was not you, please contact support immediately."
    )

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #28a745;">Password Changed</h2>
        <p>Hi <strong>{full_name}</strong>,</p>
        <p>Your ByTeBuZz account password was changed successfully.</p>
        <p style="color: #dc3545;">If this was <strong>not you</strong>, please contact support immediately.</p>
    </div>
    """

    _send_email(to_email, subject, text_body, html_body)
