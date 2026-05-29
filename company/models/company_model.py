from django.db import models
from company.models.company_user import CompanyUser
from core.models import TimeStampedModel

class Company(TimeStampedModel):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    
    # Address
    address = models.CharField(max_length=500, blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    
    # Branding
    logo = models.ImageField(upload_to='logos/', null=True, blank=True)
    banner = models.ImageField(upload_to='banners/', null=True, blank=True)
    
    # Company Info
    industry = models.CharField(max_length=100, blank=True)
    company_size = models.CharField(max_length=50, null=True, blank=True)
    founded_year = models.IntegerField(null=True, blank=True)
    stage = models.CharField(max_length=50, blank=True)
    tagline = models.CharField(max_length=150, blank=True)
    brand_color = models.CharField(max_length=20, default="#5B4DFF")
    
    # Social Links
    linkedin_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    
    # JSON Data
    tech_stack = models.JSONField(default=list, blank=True)
    benefits = models.JSONField(default=list, blank=True)
    logo_crop_data = models.JSONField(default=dict, blank=True)
    banner_crop_data = models.JSONField(default=dict, blank=True)
    
    # Employees (Many-to-Many)
    users = models.ManyToManyField(CompanyUser, related_name='companies')
    
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name
