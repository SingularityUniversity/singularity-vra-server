from django.conf import settings
EMBEDLY_KEY = lambda: settings.getattr('EMBEDLY_KEY')
