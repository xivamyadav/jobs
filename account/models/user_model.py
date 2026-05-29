"""
Custom User Model - Shared for Company Admin and Candidate roles.
Roles: COMPANY_ADMIN, CANDIDATE
For Django admin access, is_staff/is_superuser will be used.
"""

from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
    
)
from core.models.base_models import TimeStampedModel


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("account_type", "COMPANY_ADMIN")
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    """
    Unified user model for Company Admin + Candidate.
    Differentiated via the Role field.
    """

    ACCOUNT_TYPE_CHOICES = [
        ("COMPANY_ADMIN", "Company Admin"),
        ("CANDIDATE", "Candidate"),
    ]

    email = models.EmailField(unique=True, db_index=True, max_length=255)
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20, blank=True)
    account_type = models.CharField(
        max_length=20,
        choices=ACCOUNT_TYPE_CHOICES,
        default="COMPANY_ADMIN",
    )

    company_id = models.ForeignKey(
        "company.Company",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_users",
    )

    is_email_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return f"{self.email} (COMPANY_ADMIN)"
