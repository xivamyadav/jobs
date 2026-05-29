from django.urls import path
from company.views import company_auth_views as auth
from company.views.company_google_login import CompanyGoogleLoginView

urlpatterns = [
    path('register/',        auth.register,         name='company-register'),        # POST: { email, password, confirm_password }
    path('verify-email/',    auth.verify_email,      name='company-verify-email'),    # POST: { token }
    path('resend-otp/',      auth.resend_otp,        name='company-resend-otp'),      # POST: { email, purpose }
    path('login/',           auth.login,             name='company-login'),           # POST: { email, password }
    path('google/',          CompanyGoogleLoginView.as_view(), name='company-google-login'), # POST: { id_token }
    path('refresh-token/',   auth.refresh_token,     name='company-refresh-token'),   # POST: { refresh }
    path('forgot-password/', auth.forgot_password,   name='company-forgot-password'), # POST: { email }
    path('reset-password/',  auth.reset_password,    name='company-reset-password'),  # POST: { email, otp, new_password, new_password_confirm }
    path('user/',            auth.get_current_user,  name='company-current-user'),    # GET
    path('user/update/',     auth.update_profile,    name='company-update-profile'),  # PUT/PATCH
    path('logout/',          auth.logout,            name='company-logout'),          # POST
    path('change-password/', auth.change_password,   name='company-change-password'), # POST
]
