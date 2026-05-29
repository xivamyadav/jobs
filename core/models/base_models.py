"""
Base database models to be inherited by all other application models.
"""

from django.db import models


class TimeStampedModel(models.Model):
    """
    An abstract base class that provides self-updating
    'created_at' and 'updated_at' fields for audit tracking.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        abstract = True