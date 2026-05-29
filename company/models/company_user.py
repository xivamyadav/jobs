"""
CompanyUser — Separate auth model for company admins / recruiters.
Completely isolated from CandidateUser. Has its own email, password, OTP, JWT.
"""

from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class CompanyUser(models.Model):
    email = models.EmailField(unique=True, db_index=True, max_length=255)
    password = models.CharField(max_length=128)
    full_name = models.CharField(max_length=255, blank=True, default='')
    phone_number = models.CharField(max_length=20, blank=True, default='')
    is_email_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(null=True, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'company_users'
        verbose_name = 'Company User'
        verbose_name_plural = 'Company Users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email} (Company)"

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
