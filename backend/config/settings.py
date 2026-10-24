"""Réglages du site vitrine AirTrack (Django + SQLite).

En local : DJANGO_DEBUG=1 (défaut), `python manage.py runserver 0.0.0.0:8000`, le frontend Vite (port 5173)
relaie /api, /download et /admin vers ce serveur.
Sur Render : DJANGO_DEBUG=0, le build React (frontend/dist) est servi par WhiteNoise depuis ce même service.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def env(name, default=""):
    return os.environ.get(name, default).strip()


def env_bool(name, default=False):
    value = env(name, "1" if default else "0").lower()
    return value in {"1", "true", "yes", "on"}


def env_list(name):
    return [item.strip() for item in env(name).split(",") if item.strip()]


DEBUG = env_bool("DJANGO_DEBUG", True)

SECRET_KEY = env("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    if not DEBUG:
        raise RuntimeError("DJANGO_SECRET_KEY est obligatoire quand DJANGO_DEBUG=0")
    SECRET_KEY = "dev-only-insecure-key-airtrack-vitrine"

RENDER_HOST = env("RENDER_EXTERNAL_HOSTNAME")  # fourni automatiquement par Render

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0", *env_list("DJANGO_ALLOWED_HOSTS")]
if RENDER_HOST:
    ALLOWED_HOSTS.append(RENDER_HOST)
if DEBUG:
    ALLOWED_HOSTS.append("*")  # accès depuis le téléphone sur le Wi-Fi local (http://192.168.x.y:8000)

CSRF_TRUSTED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173", *env_list("CSRF_TRUSTED_ORIGINS")]
if RENDER_HOST:
    CSRF_TRUSTED_ORIGINS.append(f"https://{RENDER_HOST}")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "whitenoise.runserver_nostatic",
    "django.contrib.staticfiles",
    "vitrine",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

# Build du frontend (npm run build) servi à la racine du site en production.
FRONTEND_DIST = BASE_DIR.parent / "frontend" / "dist"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [FRONTEND_DIST] if FRONTEND_DIST.exists() else [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": env("SQLITE_PATH") or str(BASE_DIR / "db.sqlite3"),
        "OPTIONS": {"timeout": 20},
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "fr"
TIME_ZONE = "Africa/Abidjan"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage" if not DEBUG else "django.contrib.staticfiles.storage.StaticFilesStorage"},
}
# Les fichiers du build Vite (index.html, /assets/*, favicon…) sont servis tels quels à la racine.
WHITENOISE_ROOT = FRONTEND_DIST if FRONTEND_DIST.exists() else None
WHITENOISE_INDEX_FILE = True
WHITENOISE_MAX_AGE = 3600

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache", "LOCATION": "airtrack-vitrine"}}

# --- Sécurité derrière le proxy HTTPS de Render ---
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"

# --- E-mails ---
EMAIL_HOST = env("EMAIL_HOST")
if EMAIL_HOST:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_PORT = int(env("EMAIL_PORT", "587") or 587)
    EMAIL_HOST_USER = env("EMAIL_HOST_USER")
    EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD")
    EMAIL_USE_TLS = env_bool("EMAIL_USE_TLS", True)
    EMAIL_TIMEOUT = 15
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", "AirTrack <newsletter@airtrack.ci>")

# --- Contenu propre au site ---
AIRTRACK = {
    "APK_URL": env("APK_URL"),
    "APK_FILE": BASE_DIR / "downloads" / "airtrack.apk",
    "PLAY_STORE_URL": env("PLAY_STORE_URL"),
    "APP_STORE_URL": env("APP_STORE_URL"),
    "SUPPORT_EMAIL": env("SUPPORT_EMAIL", "support@airtrack.ci"),
    "SUPPORT_WHATSAPP": env("SUPPORT_WHATSAPP"),
    "PUBLIC_SITE_URL": env("PUBLIC_SITE_URL") or (f"https://{RENDER_HOST}" if RENDER_HOST else "http://localhost:5173"),
    "ANTHROPIC_API_KEY": env("ANTHROPIC_API_KEY"),
    "AI_MODEL": env("AI_MODEL", "claude-haiku-5-5"),
}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}
