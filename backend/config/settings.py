import os
from datetime import timedelta
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'insecure-secret-key')

DEBUG = os.environ.get('DJANGO_DEBUG', 'true').lower() == 'true'

ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', '*').split(',')

INSTALLED_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'cards',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

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

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

DB_NAME = os.environ.get('POSTGRES_DB')
DB_USER = os.environ.get('POSTGRES_USER')
DB_PASSWORD = os.environ.get('POSTGRES_PASSWORD')
DB_HOST = os.environ.get('POSTGRES_HOST')
DB_PORT = os.environ.get('POSTGRES_PORT', '5432')

if DB_NAME and DB_USER and DB_PASSWORD and DB_HOST:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': DB_NAME,
            'USER': DB_USER,
            'PASSWORD': DB_PASSWORD,
            'HOST': DB_HOST,
            'PORT': DB_PORT,
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'ru-ru'
TIME_ZONE = 'Europe/Moscow'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

CORS_ALLOW_ALL_ORIGINS = os.environ.get('CORS_ALLOW_ALL_ORIGINS', 'true').lower() == 'true'
CORS_ALLOWED_ORIGINS = [
    'https://giftcardstg.ru',
    'https://www.giftcardstg.ru',
    'https://giftcardstg.ru',
    'https://www.giftcardstg.ru',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = [
    'https://giftcardstg.ru',
    'https://www.giftcardstg.ru',
    'https://giftcardstg.ru',
    'https://www.giftcardstg.ru',
    'http://localhost',
    'http://127.0.0.1',
]

JAZZMIN_SETTINGS = {
    'site_title': 'Админка карточек',
    'site_header': 'Карточки',
    'site_brand': 'Панель управления',
    'welcome_sign': 'Добро пожаловать в панель управления карточками',
    'icons': {
        'auth.user': 'fas fa-user',
        'auth.group': 'fas fa-users',
        'cards.UserProfile': 'fas fa-id-badge',
        'cards.CardGroup': 'fas fa-layer-group',
        'cards.CardTemplate': 'fas fa-clone',
        'cards.CollectionCard': 'fas fa-cards',
        'cards.CardSettings': 'fas fa-cog',
        'cards.WithdrawRequest': 'fas fa-exchange-alt',
    },
}

# TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', 'telegram-bot-token')
TELEGRAM_BOT_TOKEN ='8534040237:AAHaSD_aof0rOVfDDQqejxvX286oA0MC7z0'
TELEGRAM_PAYMENT_PROVIDER_TOKEN = os.environ.get('TELEGRAM_PAYMENT_PROVIDER_TOKEN', 'payment-provider-token')
TELEGRAM_BOT_NAME = os.environ.get('TELEGRAM_BOT_NAME', 'cards129_bot')

# Внешний сервис баланса (FastAPI)
BALANCE_API_BASE_URL = os.environ.get('BALANCE_API_BASE_URL', 'https://giftcardstg.ru/internal-stars/user/')
BALANCE_API_KEY = os.environ.get('BALANCE_API_KEY', 'super_secret_key')
NOTIFY_API_BASE_URL = os.environ.get('NOTIFY_API_BASE_URL', 'https://giftcardstg.ru/withdrawals/notify')
NOTIFY_API_KEY = os.environ.get('BALANCE_API_KEY', 'super_secret_key')

LOG_LEVEL = os.environ.get('DJANGO_LOG_LEVEL', 'INFO').upper()

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{levelname}] {asctime} {name} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': LOG_LEVEL,
    },
    'loggers': {
        'django.request': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        },
    },
}
