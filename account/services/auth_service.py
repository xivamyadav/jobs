"""
Auth Service - JWT token generation and user credential validation.
"""

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class AuthService:

    @staticmethod
    def generate_tokens(user) -> dict:
        """Generate JWT tokens for the user."""
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }

    @staticmethod
    def validate_credentials(email: str, password: str):
        """
        Validate email/password credentials.
        Returns User if valid, None otherwise.
        """
        try:
            user = User.objects.get(email=email)
            if user.check_password(password) and user.is_active:
                return user
            return None
        except User.DoesNotExist:
            return None
