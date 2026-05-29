"""
Django settings for ByTeBuZz_BaCkEnD project.
"""

from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv
from corsheaders.defaults import default_headers


load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY: Crash at startup if SECRET_KEY is not set (no insecure fallback)
SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    import warnings
    warnings.warn('SECRET_KEY not found in environment. Using insecure fallback for local development only.')
    SECRET_KEY = 'django-insecure-local-dev-only-change-in-production'

# SECURITY: DEBUG from environment variable (defaults to False for safety)
DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://10.130.246.205:3000')

# SECURITY: Restrict to actual hosts (no wildcard)
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '10.130.246.205',
    '192.168.1.36',
    '90b3-114-142-164-87.ngrok-free.app',
]

# Application definition
INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_filters',

    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'channels',

    # Project apps
    'core',
    'account',
    'company',
    'jobs',
    'notifications',
    'dashboard',
    'enterprise',
    'candidate',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware', # Commented out to allow iframe PDF preview in frontend
]

ROOT_URLCONF = 'ByTeBuZz_BaCkEnD.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ByTeBuZz_BaCkEnD.wsgi.application'
ASGI_APPLICATION = 'ByTeBuZz_BaCkEnD.asgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'mysql.connector.django',
        'NAME': os.getenv('DB_NAME', 'new_db'),
        'USER': os.getenv('DB_USER', 'root'),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '3306'),
        'OPTIONS': {
            'charset': 'utf8mb4',
        },
    }
}

AUTH_USER_MODEL = 'account.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ========================================
# CACHE - Local Memory (Fallback for Windows)
# ========================================
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'bytebuzz-cache',
    }
}

# ========================================
# CHANNELS - InMemory Layer (Fallback)
# ========================================
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    },
}

# ========================================
# CELERY CONFIGURATION (Fallback)
# ========================================
CELERY_TASK_ALWAYS_EAGER = True  # Run tasks synchronously for local dev without Redis
CELERY_TIMEZONE = TIME_ZONE

# ========================================
# CORS
# ========================================
# SECURITY: Only allow specific origins (no wildcard)
# CORS_ALLOW_ALL_ORIGINS = True  # Removed to avoid overriding CORS_ALLOWED_ORIGINS
CORS_ALLOW_ALL_ORIGINS = True  # Enabled for local tunnel

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://192.168.1.36:3000",
    "http://192.168.1.36:5173",
    "http://192.168.1.43:8000",
    "http://192.168.1.52:3000",
    "http://192.168.1.37:3000", 
    "http://192.168.1.43:3001",
    "http://192.168.1.40:3000",
    "http://192.168.1.40:5173",
    "http://192.168.1.40:8000",
    "http://192.168.1.46:3000",
    "http://192.168.1.46:5173",
    "http://192.168.1.46:8000",
    "https://90b3-114-142-164-87.ngrok-free.app",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://192.168.1.36:3000",
    "http://192.168.1.36:5173",
    "http://192.168.1.43:8000",
    "http://192.168.1.52:3000",
    "http://192.168.1.37:3000", 
    "http://192.168.1.43:3001",
    "http://192.168.1.40:3000",
    "http://192.168.1.40:5173",
    "http://192.168.1.40:8000",
    "http://192.168.1.46:3000",
    "http://192.168.1.46:5173",
    "http://192.168.1.46:8000",
    "https://90b3-114-142-164-87.ngrok-free.app",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = list(default_headers) + [
    "authorization",
    "content-type",
    "accept",
    "x-correlation-id",
]

CORS_ALLOW_METHODS = ["DELETE", "GET", "OPTIONS", "PATCH", "POST", "PUT"]

# ========================================
# REST FRAMEWORK
# ========================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'core.utils.custom_auth.CustomJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'core.utils.pagination.StandardResultsSetPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    # SECURITY: Global rate limiting to prevent brute-force and spam
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '30/minute',
        'user': '120/minute',
        'otp': '3/minute',       # Strict limit for OTP endpoints
        'login': '5/minute',     # Strict limit for login attempts
    },
}

# ========================================
# JWT
# ========================================
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
}

# ========================================
# EMAIL
# ========================================
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'true').lower() == 'true'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER or 'no-reply@bytebuzz.local')

# ========================================
# GOOGLE OAUTH
# ========================================
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', '')

# ========================================
# LOGGING
# ========================================
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
        'daphne': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    },
}
# PRODUCTION SECURITY
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    if "django.middleware.clickjacking.XFrameOptionsMiddleware" not in MIDDLEWARE:
        MIDDLEWARE.append("django.middleware.clickjacking.XFrameOptionsMiddleware")
    X_FRAME_OPTIONS = "DENY"
