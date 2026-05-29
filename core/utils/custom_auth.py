"""
Custom JWT Authentication — Supports both CandidateUser and CompanyUser.
Reads user_type from token and fetches the correct user from the right table.
"""

from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from core.utils.jwt_service import decode_token


class CustomJWTAuthentication(BaseAuthentication):
    """
    Custom authentication for our separated user models.
    Reads Bearer token, decodes it, and returns the correct user object.
    Uses user_type claim from JWT for deterministic lookup.
    """

    def authenticate_header(self, request):
        return 'Bearer'

    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]
        payload = decode_token(token)

        if not payload:
            return None  # Invalid or expired token

        if payload.get('type') != 'access':
            return None  # Invalid token type

        user_id = payload.get('id')
        if not user_id:
            return None

        # SECURITY: Use user_type from JWT payload for deterministic lookup
        user_type = payload.get('user_type')

        if user_type == 'company':
            return self._lookup_company_user(user_id, payload)
        elif user_type == 'candidate':
            return self._lookup_candidate_user(user_id, payload)

        # BACKWARD COMPAT: Old tokens without user_type — fall back to path guessing
        path = request.path
        is_candidate_path = path.startswith('/api/v1/candidate/')
        is_company_path = any(path.startswith(p) for p in ['/api/v1/company/', '/api/v1/jobs/', '/api/v1/dashboard/'])

        if is_candidate_path:
            return self._lookup_candidate_user(user_id, payload)
        elif is_company_path:
            return self._lookup_company_user(user_id, payload)

        # Unknown path — try candidate first, then company
        result = self._lookup_candidate_user(user_id, payload)
        if result:
            return result
        return self._lookup_company_user(user_id, payload)

    def _lookup_candidate_user(self, user_id, payload):
        from candidate.models.candidate_user import CandidateUser
        try:
            user = CandidateUser.objects.get(id=user_id, is_active=True)
            user.user_type = 'candidate'
            return (user, payload)
        except CandidateUser.DoesNotExist:
            return None

    def _lookup_company_user(self, user_id, payload):
        from company.models.company_user import CompanyUser
        try:
            user = CompanyUser.objects.get(id=user_id, is_active=True)
            user.user_type = 'company'
            return (user, payload)
        except CompanyUser.DoesNotExist:
            return None
