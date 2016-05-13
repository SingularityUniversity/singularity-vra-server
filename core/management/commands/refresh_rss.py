from django.core.management.base import BaseCommand, CommandError
from core.models import Issue
from ingestion.rss import refresh_rss
import traceback


class Command(BaseCommand):

    help = ('Refresh the RSS feed that has the type TYPE_RSS')

    def handle(self, *args, **options):
        try:
            results = refresh_rss()
            self.stdout.write(self.style.SUCCESS(str(results)))
        except Exception as e:
            Issue.objects.create(
                source="core.management.commands.refresh_rss#Command.handle",
                error_code=Issue.ERROR_EXCEPTION,
                other={"traceback": traceback.format_exc()})
            raise CommandError(e)
