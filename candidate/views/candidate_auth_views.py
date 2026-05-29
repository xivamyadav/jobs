"""
Candidate Auth Views — Register, Login, Verify Email (OTP), Password management.
Completely separate from Company auth. Uses CandidateUser model.
OTP-based email verification (6-digit code).
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from candidate.models.candidate_user import CandidateUser
from core.utils.jwt_service import generate_tokens, refresh_access_token as jwt_refresh
from account.services.otp_service import generate_otp, verify_otp, delete_otp
from account.services.email_service import send_email_verification_otp, send_password_reset_otp


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    POST /api/v1/auth/candidate/register/
    Body: { email, password, confirm_password }
    Sends 6-digit OTP to email for verification.
    """
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')
    confirm_password = request.data.get('confirm_password', '')

    if not email:
        return Response({'success': False, 'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if not password or len(password) < 6:
        return Response({'success': False, 'error': 'Password must be at least 6 characters.'}, status=status.HTTP_400_BAD_REQUEST)
    if password != confirm_password:
        return Response({'success': False, 'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

    if CandidateUser.objects.filter(email=email).exists():
        return Response({'success': False, 'error': 'This email is already registered as a candidate.'}, status=status.HTTP_400_BAD_REQUEST)

    user = CandidateUser(email=email)
    user.set_password(password)
    user.save()

    # Generate and send OTP
    otp = generate_otp('candidate_email_verify', email)
    try:
        send_email_verification_otp(email, "Candidate", otp)
    except Exception:
        pass

    return Response({
        'success': True,
        'message': 'Registration successful. Please check your email for OTP.',
        'data': {'id': user.id, 'email': user.email}
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """
    POST /api/v1/auth/candidate/verify-email/
    Body: { email, otp }
    Verifies email using 6-digit OTP.
    """
    email = request.data.get('email', '').strip().lower()
    otp = request.data.get('otp', '').strip()

    if not email or not otp:
        return Response({'success': False, 'error': 'Email and OTP are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = CandidateUser.objects.get(email=email)
    except CandidateUser.DoesNotExist:
        return Response({'success': False, 'error': 'Candidate not found with this email.'}, status=status.HTTP_404_NOT_FOUND)

    if user.is_email_verified:
        return Response({'success': True, 'message': 'Email already verified.'}, status=status.HTTP_200_OK)

    is_valid, error_msg = verify_otp('candidate_email_verify', email, otp)
    if not is_valid:
        return Response({'success': False, 'error': error_msg}, status=status.HTTP_400_BAD_REQUEST)

    user.is_email_verified = True
    user.save(update_fields=['is_email_verified'])

    tokens = generate_tokens(user.id, user.email, 'candidate')

    return Response({
        'success': True,
        'message': 'Email verified successfully.',
        'access': tokens['access'],
        'refresh': tokens['refresh'],
        'user': {'id': user.id, 'email': user.email, 'full_name': user.full_name, 'user_type': 'candidate'}
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_otp(request):
    """
    POST /api/v1/auth/candidate/resend-otp/
    Body: { email, purpose }
    purpose: 'email_verify' or 'password_reset'
    """
    email = request.data.get('email', '').strip().lower()
    purpose = request.data.get('purpose', 'email_verify')

    try:
        user = CandidateUser.objects.get(email=email)
    except CandidateUser.DoesNotExist:
        # Security: don't reveal if email exists or not
        return Response({'success': True, 'message': 'If email exists, OTP will be sent.'}, status=status.HTTP_200_OK)

    cache_purpose = f'candidate_{purpose}'
    delete_otp(cache_purpose, email)
    otp = generate_otp(cache_purpose, email)

    try:
        if purpose == 'email_verify':
            send_email_verification_otp(email, user.full_name or "Candidate", otp)
        else:
            send_password_reset_otp(email, user.full_name or "Candidate", otp)
    except Exception:
        pass

    return Response({'success': True, 'message': 'OTP sent to your email.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    POST /api/v1/auth/candidate/login/
    Body: { email, password }
    """
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')

    if not email or not password:
        return Response({'success': False, 'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = CandidateUser.objects.get(email=email)
    except CandidateUser.DoesNotExist:
        return Response({'success': False, 'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.check_password(password) or not user.is_active:
        return Response({'success': False, 'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_email_verified:
        # Resend OTP for verification
        otp = generate_otp('candidate_email_verify', email)
        try:
            send_email_verification_otp(email, user.full_name or "Candidate", otp)
        except Exception:
            pass
        return Response({
            'success': False,
            'error': 'Email not verified. A new OTP has been sent to your email.',
            'require_verification': True,
        }, status=status.HTTP_403_FORBIDDEN)

    tokens = generate_tokens(user.id, user.email, 'candidate')

    return Response({
        'success': True,
        'access': tokens['access'],
        'refresh': tokens['refresh'],
        'user': {'id': user.id, 'email': user.email, 'full_name': user.full_name, 'user_type': 'candidate'}
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """POST /api/v1/auth/candidate/refresh-token/  Body: { refresh }"""
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
    """POST /api/v1/auth/candidate/forgot-password/  Body: { email }"""
    email = request.data.get('email', '').strip().lower()

    try:
        user = CandidateUser.objects.get(email=email)
        otp = generate_otp('candidate_password_reset', email)
        try:
            send_password_reset_otp(email, user.full_name, otp)
        except Exception:
            pass
    except CandidateUser.DoesNotExist:
        pass  # Don't reveal if email exists

    return Response({'success': True, 'message': 'If email exists, a password reset OTP has been sent.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """POST /api/v1/auth/candidate/reset-password/  Body: { email, otp, new_password, confirm_password }"""
    email = request.data.get('email', '').strip().lower()
    otp = request.data.get('otp', '').strip()
    new_password = request.data.get('new_password', '')
    confirm_password = request.data.get('confirm_password', '')

    if not all([email, otp, new_password]):
        return Response({'success': False, 'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)
    if new_password != confirm_password:
        return Response({'success': False, 'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)
    if len(new_password) < 6:
        return Response({'success': False, 'error': 'Password must be at least 6 characters.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = CandidateUser.objects.get(email=email)
    except CandidateUser.DoesNotExist:
        return Response({'success': False, 'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    is_valid, error_msg = verify_otp('candidate_password_reset', email, otp)
    if not is_valid:
        return Response({'success': False, 'error': error_msg}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save(update_fields=['password'])

    return Response({'success': True, 'message': 'Password reset successful. Please login.'}, status=status.HTTP_200_OK)
