from .auth_views import (
    register,
    login,
    logout,
    refresh_access_token,
    verify_email,
    resend_otp,
)
from .profile_views import (
    get_current_user,
    update_user_profile,
)
from .password_views import (
    forgot_password,
    reset_password,
    change_password,
)

__all__ = [
    'register',
    'login',
    'logout',
    'refresh_access_token',
    'verify_email',
    'resend_otp',
    'get_current_user',
    'update_user_profile',
    'forgot_password',
    'reset_password',
    'change_password',
]
