"""
CandidateUser — Separate auth model for candidates.
Completely isolated from CompanyUser. Has its own email, password, OTP, JWT.

Schema decisions:
  - NOT extending Django AbstractBaseUser: deliberate choice to keep candidate
    auth completely decoupled from Django admin and company auth.
  - Passwords use Django's make_password / check_password for argon2/pbkdf2 hashing.
  - date_joined is the single timestamp for account creation (no redundant created_at).
"""

from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class CandidateUser(models.Model):
    email = models.EmailField(unique=True, db_index=True, max_length=255)
    password = models.CharField(max_length=128)
    full_name = models.CharField(max_length=255, blank=True, default='')
    phone_number = models.CharField(max_length=20, blank=True, default='')
    is_email_verified = models.BooleanField(default=False, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    last_login = models.DateTimeField(null=True, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'candidate_users'
        verbose_name = 'Candidate User'
        verbose_name_plural = 'Candidate Users'
        ordering = ['-date_joined']
        indexes = [
            models.Index(fields=['email', 'is_active'], name='idx_cand_email_active'),
        ]

    def __str__(self):
        return f"{self.email} (Candidate)"

    @property
    def is_authenticated(self):
        return True

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def set_unusable_password(self):
        """For Google login users who don't need a password."""
        self.password = '!unusable'

    def has_usable_password(self):
        return self.password != '!unusable'
