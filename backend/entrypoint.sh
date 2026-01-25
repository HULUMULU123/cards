#!/bin/sh
set -e

python manage.py migrate
python manage.py collectstatic --noinput

exec gunicorn config.wsgi:application \
  --bind "${GUNICORN_BIND:-0.0.0.0:8000}" \
  --workers 4 \
  --threads 8 \
  --timeout 60 \
  --max-requests 2000 \
  --max-requests-jitter 200 \
  --access-logfile - \
  --error-logfile -
