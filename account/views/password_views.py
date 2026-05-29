"""
Password Views - Forgot password + Reset via OTP.
Nothing stored in DB - uses cache-based OTP.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
import logging

from account.models import User
from account.serializers.auth_serializers import (
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    ChangePasswordSerializer,
)
from account.services.otp_service import generate_otp, verify_otp
from account.services.email_service import (
    send_password_reset_otp,
    send_password_changed_email,
)

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """
    POST /api/v1/auth/forgot-password/
    Body: { email }
    Send OTP for password reset.
    """
    serializer = ForgotPasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'success': False, 'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    email = serializer.validated_data['email']

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Security: email doesn't exist - same response
        return Response(
            {'success': True, 'message': 'If email exists, OTP will be sent.'},
            status=status.HTTP_200_OK
        )

    otp = generate_otp('password_reset', email)

    try:
        send_password_reset_otp(email, user.full_name, otp)
    except Exception as e:
        logger.error(f"Email failed for {email} during password reset: {str(e)}")
        return Response(
            {'success': False, 'error': 'Failed to send OTP email. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return Response(
        {'success': True, 'message': 'OTP sent to your email for password reset.'},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    POST /api/v1/auth/reset-password/
    Body: { email, otp, new_password, new_password_confirm }
    Verify OTP and reset password.
    """
    serializer = ResetPasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'success': False, 'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    email = serializer.validated_data['email']
    otp = serializer.validated_data['otp']
    new_password = serializer.validated_data['new_password']

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {'success': False, 'error': 'User not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    is_valid, error_msg = verify_otp('password_reset', email, otp)
    if not is_valid:
        return Response(
            {'success': False, 'error': error_msg},
            status=status.HTTP_400_BAD_REQUEST
        )

    user.set_password(new_password)
    user.save(update_fields=['password'])

    try:
        send_password_changed_email(email, user.full_name)
    except Exception as e:
        logger.error(f"Password reset confirmation email failed for {email}: {str(e)}")

    return Response(
        {'success': True, 'message': 'Password reset successfully. Please login.'},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    POST /api/v1/auth/change-password/
    Body: { old_password, new_password, new_password_confirm }
    Logged-in user changes their password.
    """
    serializer = ChangePasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'success': False, 'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = request.user
    if not user.check_password(serializer.validated_data['old_password']):
        return Response(
            {'success': False, 'error': 'Old password is incorrect.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user.set_password(serializer.validated_data['new_password'])
    user.save(update_fields=['password'])

    try:
        send_password_changed_email(user.email, user.full_name)
    except Exception as e:
        logger.error(f"Password change confirmation email failed for {user.email}: {str(e)}")

    return Response(
        {'success': True, 'message': 'Password changed successfully.'},
        status=status.HTTP_200_OK
    )
