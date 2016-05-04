from django.core.management.base import BaseCommand, CommandError
from ingestion.rss import refresh_rss


class Command(BaseCommand):

    help = ('Refresh the RSS feed that has the type TYPE_RSS')

    def handle(self, *args, **options):
        try:
            results = refresh_rss()
            self.stdout.write(self.style.SUCCESS(results))
        except Exception as e:
            raise CommandError(e)
