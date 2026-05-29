"""
Custom JWT Token Service — Generates and verifies tokens for CandidateUser and CompanyUser separately.
Tokens include user_type claim so backend knows which table to look up.
"""

import jwt
from datetime import datetime, timedelta
from django.conf import settings


ACCESS_TOKEN_LIFETIME = timedelta(hours=1)
REFRESH_TOKEN_LIFETIME = timedelta(days=7)
ALGORITHM = 'HS256'


def generate_tokens(user_id, email, user_type):
    """
    Generate access + refresh JWT tokens.
    user_type MUST be 'company' or 'candidate' — embedded in token
    so the auth backend can deterministically find the correct user.
    """
    now = datetime.utcnow()

    access_payload = {
        'id': user_id,
        'username': email,
        'user_type': user_type,   # SECURITY: identifies which DB table to query
        'type': 'access',
        'iat': now,
        'exp': now + ACCESS_TOKEN_LIFETIME,
    }

    refresh_payload = {
        'id': user_id,
        'username': email,
        'user_type': user_type,   # SECURITY: preserved across token refresh
        'type': 'refresh',
        'iat': now,
        'exp': now + REFRESH_TOKEN_LIFETIME,
    }

    access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm=ALGORITHM)
    refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm=ALGORITHM)

    return {
        'access': access_token,
        'refresh': refresh_token,
    }


def decode_token(token):
    """
    Decode a JWT token. Returns payload dict or None if invalid/expired.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def refresh_access_token(refresh_token_str):
    """
    Generate a new access token from a valid refresh token.
    Returns new access token string or None.
    """
    payload = decode_token(refresh_token_str)
    if not payload or payload.get('type') != 'refresh':
        return None

    # SECURITY: Preserve user_type from refresh token into new access token
    return generate_tokens(payload['id'], payload.get('username'), payload.get('user_type'))['access']
