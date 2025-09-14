"""
Development settings for accommodation_portal project.
"""

from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Database for development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# CORS settings for development (more permissive)
CORS_ALLOW_ALL_ORIGINS = True

# Static files for development
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Logging for development
LOGGING['handlers']['console']['level'] = 'DEBUG'
LOGGING['root']['level'] = 'DEBUG'

# Django Extensions for development
if 'django_extensions' in INSTALLED_APPS:
    SHELL_PLUS = 'ipython'
    SHELL_PLUS_PRINT_SQL = True
