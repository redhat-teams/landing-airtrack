# Site vitrine AirTrack : un seul service (Django sert l'API, l'admin et le build React).

# --- 1. Build du frontend React (Vite) ---
FROM node:22-alpine AS web
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

# --- 2. Backend Django ---
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_DEBUG=0 \
    PORT=8000
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./
COPY --from=web /app/frontend/dist /app/frontend/dist
RUN DJANGO_SECRET_KEY=build-only python manage.py collectstatic --noinput

EXPOSE 8000
# Migrations + compte admin (si DJANGO_SUPERUSER_* sont définies) puis Gunicorn.
CMD ["sh", "-c", "python manage.py migrate --noinput && (python manage.py createsuperuser --noinput 2>/dev/null || true) && exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT} --workers 2 --threads 2 --timeout 60 --access-logfile -"]
