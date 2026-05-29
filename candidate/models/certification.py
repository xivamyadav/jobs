import uuid
import os
from django.db import models
from candidate.models.candidateprofile import CandidateProfile

def certification_file_upload_path(instance, filename):
    return ""

class Certification(models.Model):
    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='certifications'
    )
    
    # Matching the UI fields
    name = models.CharField(max_length=255)
    issuing_organization = models.CharField(max_length=255, blank=False, null=False, default='')
    completion_id = models.CharField(max_length=255, blank=True, default='')
    url = models.URLField(max_length=500, blank=True, default='')
    
    # Validity fields (Month 1-12, Year)
    valid_from_month = models.PositiveSmallIntegerField(null=True, blank=True)
    valid_from_year = models.PositiveSmallIntegerField(null=True, blank=True)
    
    valid_to_month = models.PositiveSmallIntegerField(null=True, blank=True)
    valid_to_year = models.PositiveSmallIntegerField(null=True, blank=True)
    
    does_not_expire = models.BooleanField(default=False)
    

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'candidate_certification'
        ordering = ['-valid_from_year', '-valid_from_month']

    def __str__(self):
        return f"{self.name} - {self.candidate.full_name}"
