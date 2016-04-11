web: gunicorn vra_server.wsgi --keep-alive 2 --log-file -
worker: celery --app=vra_server.celery_app worker --loglevel=INFO
