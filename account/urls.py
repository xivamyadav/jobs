from django.urls import path
from account.views.auth_views import (
    register, register_candidate, register_company,
    login, logout, refresh_access_token, verify_email, resend_otp,
)
from account.views.profile_views import get_current_user, update_user_profile
from account.views.password_views import forgot_password, reset_password, change_password

app_name = 'auth'

urlpatterns = [
    # ── REGISTRATION (Separate URLs — no account_type needed from frontend) ──
    path('candidate/register/', register_candidate, name='auth-user-candidate'), # POST: { email, password, password_confirm, full_name, phone_number? }
    path('company/register/',   register_company,   name='auth-user-company'),   # POST: { email, password, password_confirm, full_name, phone_number? }

    # ── OTP VERIFICATION ──
    path('verify-email/',  verify_email,  name='verify_email'),  # POST: { email, otp }
    path('resend-otp/',    resend_otp,    name='resend_otp'),    # POST: { email, purpose }

    # ── LOGIN / LOGOUT / TOKEN ──
    path('login/',         login,                name='login'),          # POST: { email, password }
    path('logout/',        logout,               name='logout'),         # POST: { refresh }
    path('refresh-token/', refresh_access_token, name='refresh_token'),  # POST: { refresh }

    # ── PROFILE ──
    path('user/',          get_current_user,    name='current_user'),    # GET
    path('user/update/',   update_user_profile, name='update_user'),     # PATCH: { first_name, last_name, phone_number }

    # ── PASSWORD ──
    path('forgot-password/', forgot_password, name='forgot_password'),   # POST: { email }
    path('reset-password/',  reset_password,  name='reset_password'),    # POST: { email, otp, new_password, new_password_confirm }
    path('change-password/', change_password, name='change_password'),   # POST: { old_password, new_password, new_password_confirm }
]
