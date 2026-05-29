"""
Candidate Google Login — Separate from Company Google Login.
Frontend sends Google id_token → backend verifies → returns JWT tokens.
If user doesn't exist, auto-create with verified email.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from django.conf import settings
from django.utils import timezone

from google.oauth2 import id_token
from google.auth.transport import requests

from candidate.models.candidate_user import CandidateUser
from core.utils.jwt_service import generate_tokens


class CandidateGoogleLoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        """POST /api/v1/auth/candidate/google/  Body: { id_token }"""
        token = request.data.get("id_token")

        if not token:
            return Response({"success": False, "error": "id_token is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            google_info = id_token.verify_oauth2_token(
                token, requests.Request(),
                settings.GOOGLE_CLIENT_ID,
                clock_skew_in_seconds=300
            )

            email = google_info.get("email", "").lower().strip()
            name = google_info.get("name", "")
            picture = google_info.get("picture", "")

            if not email:
                return Response({"success": False, "error": "Google account has no email."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                user = CandidateUser.objects.get(email=email)
                created = False
            except CandidateUser.DoesNotExist:
                user = CandidateUser(email=email, full_name=name, is_email_verified=True, is_active=True)
                user.set_unusable_password()
                user.save()
                created = True

            if not user.is_email_verified:
                user.is_email_verified = True
                user.save(update_fields=['is_email_verified'])

            if not user.is_active:
                return Response({"success": False, "error": "Your account has been deactivated."}, status=status.HTTP_403_FORBIDDEN)

            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])

            tokens = generate_tokens(user.id, user.email, 'candidate')

            return Response({
                "success": True,
                "message": "Google login successful.",
                "created": created,
                "access": tokens['access'],
                "refresh": tokens['refresh'],
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "full_name": user.full_name,
                    "is_email_verified": user.is_email_verified,
                    "name": name,
                    "picture": picture,
                    "user_type": "candidate",
                }
            }, status=status.HTTP_200_OK)

        except ValueError as e:
            return Response({"success": False, "error": f"Invalid Google token: {e}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"success": False, "error": "Google authentication failed."}, status=status.HTTP_400_BAD_REQUEST)
