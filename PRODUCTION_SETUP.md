# 🚀 ByTeBuZz Production Deployment Guide

## ⚠️ CRITICAL SECURITY STEPS

### 1. **Environment Configuration**
```bash
# Copy the example file
cp .env.example .env

# Edit with your production values
nano .env
```

**Required changes:**
- `SECRET_KEY`: Generate new with `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
- `DEBUG=false` (must be false in production)
- `DB_PASSWORD`: Use secure password (min 12 chars, mixed case, numbers, symbols)
- `EMAIL_HOST_PASSWORD`: Gmail App Password (not regular password)
- `FRONTEND_URL`: Your actual domain
- `ALLOWED_HOSTS`: Add your production domain

### 2. **Regenerate All Credentials**
- [ ] Django SECRET_KEY (see above)
- [ ] Database password
- [ ] Gmail app-specific password (2FA must be enabled)
- [ ] NextAuth secret

### 3. **Frontend Environment Files**
```bash
# Company Frontend
front/.env.production.local
NEXTAUTH_SECRET=<strong-random-value>
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Candidate Frontend
candidate_frontend/.env.production.local
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 4. **Database Setup**
```bash
# Backup existing database
mysqldump -u root -p industry_db > backup.sql

# Run migrations on production
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 5. **Static Files & Media**
```bash
# Collect static files
python manage.py collectstatic --noinput

# Ensure media directory has proper permissions
chmod -R 755 media/
```

### 6. **Security Headers (settings.py)**
```python
# Already configured:
- SECURE_SSL_REDIRECT = True
- SESSION_COOKIE_SECURE = True
- CSRF_COOKIE_SECURE = True
- X_FRAME_OPTIONS = 'DENY'
```

### 7. **CORS Configuration**
Update `ALLOWED_ORIGINS` in settings.py with your production domains only.

### 8. **Logging Setup**
Add to settings.py for production:
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'logs/django.log',
            'maxBytes': 1024 * 1024 * 15,
            'backupCount': 10,
        },
    },
    'root': {
        'handlers': ['file'],
        'level': 'ERROR',
    },
}
```

### 9. **Server Requirements**
- Node.js 18+ (for Next.js frontends)
- Python 3.9+
- MySQL 8.0+
- Redis (for caching/sessions, optional but recommended)

### 10. **Deployment Checklist**
- [ ] All credentials regenerated
- [ ] DEBUG = false
- [ ] SECRET_KEY unique and secure
- [ ] Database backed up
- [ ] Migrations run
- [ ] Static files collected
- [ ] HTTPS/SSL certificate installed
- [ ] CORS whitelist configured
- [ ] Email service tested
- [ ] Error logging configured
- [ ] `.env` file excluded from git
- [ ] Backup strategy in place

### 11. **Testing Before Deploy**
```bash
# Test production build
npm run build  # for frontends

# Run tests (if available)
pytest

# Check for console.log statements (should be none)
grep -r "console.log" src/

# Check for print statements in backend (should be minimal)
grep -r "print(" --include="*.py" | grep -v test
```

## 🔒 Files to NEVER Commit
- `.env` (use `.env.example`)
- Private keys/certificates
- AWS credentials
- Database backups
- node_modules/
- __pycache__/

## 📊 Performance Optimization
1. Enable GZIP compression
2. Use CDN for static assets
3. Set up caching headers
4. Database query optimization
5. Redis caching for sessions

## 🆘 Rollback Plan
Keep database backups and previous version tags available for quick rollback if needed.
