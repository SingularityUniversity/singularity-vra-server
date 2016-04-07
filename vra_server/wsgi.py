"""
WSGI config for vra_server project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.9/howto/deployment/wsgi/
"""

import os
from os.path import join, dirname
from dotenv import load_dotenv

dotenv_path = join(join(dirname(__file__), os.path.pardir), '.env')
load_dotenv(dotenv_path)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "vra_server.settings")

from django.core.wsgi import get_wsgi_application
from whitenoise.django import DjangoWhiteNoise

application = get_wsgi_application()
application = DjangoWhiteNoise(application)
