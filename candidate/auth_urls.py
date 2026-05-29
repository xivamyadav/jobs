from django.urls import path
from candidate.views import candidate_auth_views as auth
from candidate.views.candidate_google_login import CandidateGoogleLoginView

urlpatterns = [
    path('register/',        auth.register,         name='candidate-register'),        # POST: { email, password, confirm_password }
    path('verify-email/',    auth.verify_email,      name='candidate-verify-email'),    # POST: { email, otp }
    path('resend-otp/',      auth.resend_otp,        name='candidate-resend-otp'),      # POST: { email, purpose }
    path('login/',           auth.login,             name='candidate-login'),           # POST: { email, password }
    path('google/',          CandidateGoogleLoginView.as_view(), name='candidate-google-login'), # POST: { id_token }
    path('refresh-token/',   auth.refresh_token,     name='candidate-refresh-token'),   # POST: { refresh }
    path('forgot-password/', auth.forgot_password,   name='candidate-forgot-password'), # POST: { email }
    path('reset-password/',  auth.reset_password,    name='candidate-reset-password'),  # POST: { email, otp, new_password, confirm_password }
]
