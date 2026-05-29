"""
Company Auth Views — Register, Login, Verify Email, Password management.
Completely separate from Candidate auth. Uses CompanyUser model.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from company.models.company_user import CompanyUser
from core.utils.jwt_service import generate_tokens, refresh_access_token as jwt_refresh, decode_token
from account.services.otp_service import generate_otp, verify_otp, delete_otp
from account.services.email_service import send_email_verification_otp, send_password_reset_otp
from django.conf import settings
from django.core.signing import dumps, loads, SignatureExpired, BadSignature
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError


# SECURITY: Custom throttles for sensitive endpoints
class LoginThrottle(AnonRateThrottle):
    rate = '5/minute'

class OTPThrottle(AnonRateThrottle):
    rate = '3/minute'

class RegisterThrottle(AnonRateThrottle):
    rate = '5/minute'


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([RegisterThrottle])
def register(request):
    """POST /api/v1/auth/company/register/  Body: { email, password, confirm_password }"""
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')
    confirm_password = request.data.get('confirm_password', '')

    if not email:
        return Response({'success': False, 'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if not password:
        return Response({'success': False, 'error': 'Password is required.'}, status=status.HTTP_400_BAD_REQUEST)
    # SECURITY: Use Django's built-in password validators (min 8 chars, not common, etc.)
    try:
        validate_password(password)
    except DjangoValidationError as e:
        return Response({'success': False, 'error': e.messages[0]}, status=status.HTTP_400_BAD_REQUEST)
    if password != confirm_password:
        return Response({'success': False, 'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

    if CompanyUser.objects.filter(email=email).exists():
        return Response({'success': False, 'error': 'This email is already registered as a company user.'}, status=status.HTTP_400_BAD_REQUEST)

    user = CompanyUser(email=email)
    user.set_password(password)
    user.save()

    otp = generate_otp('company_email_verify', email)
    try:
        send_email_verification_otp(email, "Company", otp)
    except Exception:
        pass

    return Response({
        'success': True,
        'message': 'Company registration successful. Please check your email for OTP.',
        'data': {'id': user.id, 'email': user.email}
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """POST /api/v1/auth/company/verify-email/  Body: { email, otp }"""
    email = request.data.get('email', '').strip().lower()
    otp = request.data.get('otp', '').strip()

    if not email or not otp:
        return Response({'success': False, 'error': 'Email and OTP are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = CompanyUser.objects.get(email=email)
    except CompanyUser.DoesNotExist:
        return Response({'success': False, 'error': 'Company user not found with this email.'}, status=status.HTTP_404_NOT_FOUND)

    if user.is_email_verified:
        return Response({'success': True, 'message': 'Email already verified.'}, status=status.HTTP_200_OK)

    is_valid, error_msg = verify_otp('company_email_verify', email, otp)
    if not is_valid:
        return Response({'success': False, 'error': error_msg}, status=status.HTTP_400_BAD_REQUEST)

    user.is_email_verified = True
    user.save(update_fields=['is_email_verified'])

    tokens = generate_tokens(user.id, user.email, 'company')

    return Response({
        'success': True,
        'message': 'Email verified successfully.',
        'access': tokens['access'],
        'refresh': tokens['refresh'],
        'user': {'id': user.id, 'email': user.email, 'full_name': user.full_name, 'user_type': 'company'}
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([OTPThrottle])
def resend_otp(request):
    """POST /api/v1/auth/company/resend-otp/  Body: { email, purpose }"""
    email = request.data.get('email', '').strip().lower()
    purpose = request.data.get('purpose', 'email_verify')

    try:
        user = CompanyUser.objects.get(email=email)
    except CompanyUser.DoesNotExist:
        return Response({'success': True, 'message': 'If email exists, OTP will be sent.'}, status=status.HTTP_200_OK)

    cache_purpose = f'company_{purpose}'
    otp = generate_otp(cache_purpose, email)

    try:
        if purpose == 'email_verify':
            send_email_verification_otp(email, getattr(user, 'full_name', "Company"), otp)
        else:
            send_password_reset_otp(email, getattr(user, 'full_name', "Company"), otp)
    except Exception:
        pass

    return Response({'success': True, 'message': 'OTP sent to your email.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([LoginThrottle])
def login(request):
    """POST /api/v1/auth/company/login/  Body: { email, password }"""
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')

    if not email or not password:
        return Response({'success': False, 'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = CompanyUser.objects.get(email=email)
    except CompanyUser.DoesNotExist:
        return Response({'success': False, 'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.check_password(password) or not user.is_active:
        return Response({'success': False, 'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_email_verified:
        otp = generate_otp('company_email_verify', email)
        try:
            send_email_verification_otp(email, getattr(user, 'full_name', "Company"), otp)
        except Exception:
            pass
        return Response({
            'success': False,
            'error': 'Email not verified. A new OTP has been sent.',
            'require_verification': True,
        }, status=status.HTTP_403_FORBIDDEN)

    tokens = generate_tokens(user.id, user.email, 'company')

    return Response({
        'success': True,
        'access': tokens['access'],
        'refresh': tokens['refresh'],
        'user': {'id': user.id, 'email': user.email, 'full_name': user.full_name, 'user_type': 'company'}
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """POST /api/v1/auth/company/refresh-token/  Body: { refresh }"""
    refresh = request.data.get('refresh', '')
    if not refresh:
        return Response({'success': False, 'error': 'Refresh token required.'}, status=status.HTTP_400_BAD_REQUEST)

    new_access = jwt_refresh(refresh)
    if not new_access:
        return Response({'success': False, 'error': 'Invalid or expired refresh token.'}, status=status.HTTP_401_UNAUTHORIZED)

    return Response({'access': new_access}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """POST /api/v1/auth/company/forgot-password/  Body: { email }"""
    email = request.data.get('email', '').strip().lower()

    try:
        user = CompanyUser.objects.get(email=email)
        otp = generate_otp('company_password_reset', email)
        try:
            send_password_reset_otp(email, user.full_name, otp)
        except Exception:
            pass
    except CompanyUser.DoesNotExist:
        pass

    return Response({'success': True, 'message': 'If email exists, a password reset OTP has been sent.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """POST /api/v1/auth/company/reset-password/  Body: { email, otp, new_password, new_password_confirm }"""
    email = request.data.get('email', '').strip().lower()
    otp = request.data.get('otp', '').strip()
    new_password = request.data.get('new_password', '')
    new_password_confirm = request.data.get('new_password_confirm', '')

    if not all([email, otp, new_password]):
        return Response({'success': False, 'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)
    if new_password != new_password_confirm:
        return Response({'success': False, 'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        validate_password(new_password)
    except DjangoValidationError as e:
        return Response({'success': False, 'error': e.messages[0]}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = CompanyUser.objects.get(email=email)
    except CompanyUser.DoesNotExist:
        return Response({'success': False, 'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    is_valid, error_msg = verify_otp('company_password_reset', email, otp)
    if not is_valid:
        return Response({'success': False, 'error': error_msg}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save(update_fields=['password'])

    return Response({'success': True, 'message': 'Password reset successful. Please login.'}, status=status.HTTP_200_OK)


# ── Authenticated endpoints ──────────────────────────────────────────────

from rest_framework.permissions import IsAuthenticated
from core.utils.custom_auth import CustomJWTAuthentication
from rest_framework.decorators import authentication_classes, permission_classes


@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """GET /api/v1/auth/company/user/  — Return current logged-in company user."""
    user = request.user
    return Response({
        'success': True,
        'data': {
            'id': user.id,
            'email': user.email,
            'full_name': getattr(user, 'full_name', ''),
            'phone_number': getattr(user, 'phone_number', ''),
            'is_email_verified': getattr(user, 'is_email_verified', False),
            'role': getattr(user, 'role', 'COMPANY_ADMIN'),
            'user_type': getattr(user, 'user_type', 'company'),
        }
    }, status=status.HTTP_200_OK)


@api_view(['PUT', 'PATCH'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """PUT/PATCH /api/v1/auth/company/user/update/  — Update company user profile."""
    user = request.user
    data = request.data

    if 'full_name' in data and hasattr(user, 'full_name'):
        user.full_name = data['full_name']
    if 'phone_number' in data and hasattr(user, 'phone_number'):
        user.phone_number = data['phone_number']

    user.save()

    return Response({
        'success': True,
        'data': {
            'id': user.id,
            'email': user.email,
            'full_name': getattr(user, 'full_name', ''),
            'phone_number': getattr(user, 'phone_number', ''),
            'is_email_verified': getattr(user, 'is_email_verified', False),
            'role': getattr(user, 'role', 'COMPANY_ADMIN'),
            'user_type': getattr(user, 'user_type', 'company'),
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def logout(request):
    """POST /api/v1/auth/company/logout/  — Logout and blacklist refresh token."""
    # SECURITY: Blacklist refresh token so stolen tokens become useless
    refresh_token = request.data.get('refresh', '')
    if refresh_token:
        try:
            from rest_framework_simplejwt.tokens import RefreshToken
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass  # Token may already be expired/invalid — still logout
    return Response({'success': True, 'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def change_password(request):
    """POST /api/v1/auth/company/change-password/  Body: { old_password, change_password, confirm_password }"""
    user = request.user
    old_password = request.data.get('old_password', '')
    new_password = request.data.get('change_password', '')
    confirm_password = request.data.get('confirm_password', '')

    if not user.check_password(old_password):
        return Response({'success': False, 'error': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
    if not new_password:
        return Response({'success': False, 'error': 'New password is required.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        validate_password(new_password)
    except DjangoValidationError as e:
        return Response({'success': False, 'error': e.messages[0]}, status=status.HTTP_400_BAD_REQUEST)
    if new_password != confirm_password:
        return Response({'success': False, 'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save(update_fields=['password'])

    return Response({'success': True, 'message': 'Password changed successfully.'}, status=status.HTTP_200_OK)
