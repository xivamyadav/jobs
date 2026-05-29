"""
Auth Serializers - For Register, Login, Profile, and Password management.
Only COMPANY_ADMIN account type allowed initially.
"""

from rest_framework import serializers
from account.models import User


class UserSerializer(serializers.ModelSerializer):
    """For User data response."""

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'phone_number',
            'account_type',
            'is_email_verified',
            'company_id',
        ]
        read_only_fields = ['id', 'is_email_verified', 'account_type']


class RegisterSerializer(serializers.Serializer):
    """
    Registration — For both Company Admin and Candidate.
    Body: { email, password, password_confirm, full_name, phone_number?, account_type? }
    account_type: "COMPANY_ADMIN" (default) or "CANDIDATE"
    """

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)
    full_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    phone_number = serializers.CharField(max_length=20, required=False, allow_blank=True)
    account_type = serializers.ChoiceField(
        choices=['COMPANY_ADMIN', 'CANDIDATE'],
        default='COMPANY_ADMIN',
        required=False,
    )

    def validate_email(self, value):
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("Email already registered.")
        return value.lower()

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match.'
            })
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        password = validated_data.pop('password')
        account_type = validated_data.pop('account_type', 'COMPANY_ADMIN')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=password,
            full_name=validated_data.get('full_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            account_type=account_type,
        )
        return user


class LoginSerializer(serializers.Serializer):
    """User login."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        return value.lower()


class VerifyEmailSerializer(serializers.Serializer):
    """Email verification OTP confirm."""

    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)

    def validate_email(self, value):
        return value.lower()


class ResendOTPSerializer(serializers.Serializer):
    """Resend OTP request."""

    email = serializers.EmailField()
    purpose = serializers.ChoiceField(choices=['email_verify', 'password_reset'])

    def validate_email(self, value):
        return value.lower()


class ForgotPasswordSerializer(serializers.Serializer):
    """Forget password - send email to get OTP."""

    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower()


class ResetPasswordSerializer(serializers.Serializer):
    """Reset password using OTP."""

    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(write_only=True, min_length=6)
    new_password_confirm = serializers.CharField(write_only=True, min_length=6)

    def validate_email(self, value):
        return value.lower()

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Passwords do not match.'
            })
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Change password for logged-in user."""

    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)
    new_password_confirm = serializers.CharField(write_only=True, min_length=6)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Passwords do not match.'
            })
        return attrs


class UpdateProfileSerializer(serializers.ModelSerializer):
    """Profile update."""

    class Meta:
        model = User
        fields = ['full_name', 'phone_number']
