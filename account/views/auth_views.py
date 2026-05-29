"""
Auth Views - Register, Login, Logout, Token Refresh.
Email verify via OTP (cache-based, no DB).
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from account.models import User
from account.serializers.auth_serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    VerifyEmailSerializer,
    ResendOTPSerializer,
)
from account.services.auth_service import AuthService
from account.services.otp_service import generate_otp, verify_otp, delete_otp
from account.services.email_service import send_email_verification_otp


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    POST /api/v1/auth/register/
    Generic register (kept for backward compatibility).
    """
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    user = serializer.save()
    otp = generate_otp('email_verify', user.email)
    try:
        send_email_verification_otp(user.email, user.full_name, otp)
    except Exception:
        pass
    return Response({'success': True, 'message': 'Registration successful. Please check your email for OTP.', 'data': UserSerializer(user).data}, status=status.HTTP_201_CREATED)


def _do_register(request, account_type):
    """Internal helper — shared logic for candidate & company register."""
    data = request.data.copy()
    data['account_type'] = account_type          # set automatically, frontend sends nothing
    serializer = RegisterSerializer(data=data)
    if not serializer.is_valid():
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    user = serializer.save()
    otp = generate_otp('email_verify', user.email)
    try:
        send_email_verification_otp(user.email, user.full_name, otp)
    except Exception:
        pass
    return Response({'success': True, 'message': 'Registration successful. Please check your email for OTP.', 'data': UserSerializer(user).data}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_candidate(request):
    """
    POST /api/v1/auth/candidate/register/
    Register as a Candidate. No account_type needed from frontend.
    Body: { email, password, password_confirm, full_name, phone_number? }
    """
    return _do_register(request, 'CANDIDATE')


@api_view(['POST'])
@permission_classes([AllowAny])
def register_company(request):
    """
    POST /api/v1/auth/company/register/
    Register as a Company Admin. No account_type needed from frontend.
    Body: { email, password, password_confirm, full_name, phone_number? }
    """
    return _do_register(request, 'COMPANY_ADMIN')


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """
    POST /api/v1/auth/verify-email/
    Verify email using OTP.
    Body: { email, otp }
    """
    serializer = VerifyEmailSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'success': False, 'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    email = serializer.validated_data['email']
    otp = serializer.validated_data['otp']

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {'success': False, 'error': 'User not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    if user.is_email_verified:
        return Response(
            {'success': True, 'message': 'Email already verified.'},
            status=status.HTTP_200_OK
        )

    is_valid, error_msg = verify_otp('email_verify', email, otp)
    if not is_valid:
        return Response(
            {'success': False, 'error': error_msg},
            status=status.HTTP_400_BAD_REQUEST
        )

    user.is_email_verified = True
    user.save(update_fields=['is_email_verified'])

    tokens = AuthService.generate_tokens(user)

    return Response(
        {
            'success': True,
            'message': 'Email verified successfully.',
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'user': UserSerializer(user).data,
        },
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_otp(request):
    """
    POST /api/v1/auth/resend-otp/
    Resend OTP.
    Body: { email, purpose: 'email_verify' | 'password_reset' }
    """
    serializer = ResendOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'success': False, 'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    email = serializer.validated_data['email']
    purpose = serializer.validated_data['purpose']

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Security: don't reveal if email exists or not
        return Response(
            {'success': True, 'message': 'If email exists, OTP will be sent.'},
            status=status.HTTP_200_OK
        )

    delete_otp(purpose, email)
    otp = generate_otp(purpose, email)

    try:
        if purpose == 'email_verify':
            send_email_verification_otp(email, user.full_name, otp)
        else:
            from account.services.email_service import send_password_reset_otp
            send_password_reset_otp(email, user.full_name, otp)
    except Exception:
        pass

    return Response(
        {'success': True, 'message': 'OTP sent to your email.'},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    POST /api/v1/auth/login/
    Body: { email, password }
    Returns: { access, refresh, user }
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'success': False, 'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    email = serializer.validated_data['email']
    password = serializer.validated_data['password']

    user = AuthService.validate_credentials(email, password)
    if not user:
        return Response(
            {'success': False, 'error': 'Invalid email or password.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_email_verified:
        # Resend OTP
        otp = generate_otp('email_verify', user.email)
        try:
            send_email_verification_otp(user.email, user.full_name, otp)
        except Exception:
            pass

        return Response(
            {
                'success': False,
                'error': 'Email not verified. A new OTP has been sent to your email.',
                'require_verification': True,
            },
            status=status.HTTP_403_FORBIDDEN
        )

    tokens = AuthService.generate_tokens(user)

    return Response(
        {
            'success': True,
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'user': UserSerializer(user).data,
        },
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    """
    POST /api/v1/auth/logout/
    Body: { refresh }
    Blacklist the refresh token.
    """
    refresh_token = request.data.get('refresh')
    if refresh_token:
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass  # Already blacklisted or invalid

    return Response(
        {'success': True, 'message': 'Logged out successfully.'},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_access_token(request):
    """
    POST /api/v1/auth/refresh-token/
    Body: { refresh }
    Returns: { access }
    """
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response(
            {'success': False, 'error': 'Refresh token required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        refresh = RefreshToken(refresh_token)
        return Response(
            {'access': str(refresh.access_token)},
            status=status.HTTP_200_OK
        )
    except Exception:
        return Response(
            {'success': False, 'error': 'Invalid or expired refresh token.'},
            status=status.HTTP_401_UNAUTHORIZED
        )
