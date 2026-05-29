from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views.company_views import CompanyViewSet

router = SimpleRouter()
router.register(r'', CompanyViewSet, basename='company')

company_my_company = CompanyViewSet.as_view({'get': 'my_company', 'patch': 'my_company', 'put': 'my_company'})
company_my_company_upload_logo = CompanyViewSet.as_view({'post': 'upload_my_company_logo'})
company_my_company_upload_banner = CompanyViewSet.as_view({'post': 'upload_my_company_banner'})

urlpatterns = [
    path('my_company/',             company_my_company,              name='company-my-company'),             # GET | PATCH: { name, website, industry, description, company_size, founded_year, headquarters_location }
    path('my_company/upload_logo/', company_my_company_upload_logo,  name='company-my-company-upload-logo'), # POST: Form-Data { logo }
    path('my_company/upload_banner/', company_my_company_upload_banner, name='company-my-company-upload-banner'), # POST: Form-Data { banner }
    path('', include(router.urls)),
]
