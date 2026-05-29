from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views.job_views import JobViewSet

router = SimpleRouter()
router.register(r'', JobViewSet, basename='job')

# GET    /api/v1/jobs/            → List company's jobs
# POST   /api/v1/jobs/            → Create job: { title, description, location, job_type, experience_level, salary_min, salary_max, required_skills[], is_remote, vacancies, application_deadline }
# GET    /api/v1/jobs/<id>/       → Job detail
# PATCH  /api/v1/jobs/<id>/       → Update job (any fields from above)
# DELETE /api/v1/jobs/<id>/       → Delete job (also deletes all linked applications)
# POST   /api/v1/jobs/<id>/publish/         → Publish job (visible to candidates)
# POST   /api/v1/jobs/<id>/pause/           → Pause job (hidden from candidates)
# POST   /api/v1/jobs/<id>/increment_views/ → Increment view count

urlpatterns = [
    path('', include(router.urls)),
]