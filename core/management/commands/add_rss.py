from django.core.management.base import BaseCommand, CommandError
from ingestion.rss import ingest_rss


class Command(BaseCommand):

    help = ('Adds RSS feeds to EnteredSource (if not already there) '
            'and performs a one-time poll of a RSS feed!')

    def add_arguments(self, parser):
        parser.add_argument('url')

    def handle(self, *args, **options):
        url = options['url']

        results = ingest_rss(url)
        if 'error' in results:
            raise CommandError(results['error'])
        else:
            print(results)
