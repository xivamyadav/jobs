from django.db import models
from django.contrib.auth import get_user_model
from company.models import Company
from company.models import Company
import string, random

User = get_user_model()

def generate_job_code():
    """Generate a unique 4-char alphanumeric job code like BH-A3K9"""
    chars = string.ascii_uppercase + string.digits
    code = ''.join(random.choices(chars, k=4))
    return f"BH-{code}"

class Job(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('paused', 'Paused'),
        ('expired', 'Expired'),
    ]

    JOB_TYPE_CHOICES = [
        ('full-time', 'Full-time'),
        ('part-time', 'Part-time'),
        ('contract', 'Contract'),
        ('temporary', 'Temporary'),
    ]

    EXPERIENCE_CHOICES = [
        ('entry', 'Entry Level'),
        ('mid', 'Mid Level'),
        ('senior', 'Senior Level'),
        ('executive', 'Executive'),
    ]

    # Basic Info
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='jobs')
    job_code = models.CharField(max_length=10, unique=True, default=generate_job_code, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Job Details
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES)
    experience_min = models.IntegerField(default=0, null=True, blank=True)
    experience_max = models.IntegerField(default=1, null=True, blank=True)
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=10, default='USD')
    
    # Requirements
    required_skills = models.JSONField(default=list)  # ["Python", "Django", "REST API"]
    qualifications = models.TextField(blank=True)
    
    # Location
    location = models.ForeignKey('enterprise.Location', on_delete=models.SET_NULL, null=True, blank=True, related_name='jobs')
    is_remote = models.BooleanField(default=False)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    published_at = models.DateTimeField(null=True, blank=True)
    
    # Analytics
    views_count = models.IntegerField(default=0)
    applications_count = models.IntegerField(default=0)
    
    # Post Info
    posted_by = models.ForeignKey('company.CompanyUser', on_delete=models.SET_NULL, null=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['company', '-created_at']),
            models.Index(fields=['status', '-published_at']),
        ]

    def save(self, *args, **kwargs):
        # Ensure unique job_code
        if not self.job_code:
            for _ in range(10):
                code = generate_job_code()
                if not Job.objects.filter(job_code=code).exists():
                    self.job_code = code
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.job_code}] {self.title} at {self.company.name}"