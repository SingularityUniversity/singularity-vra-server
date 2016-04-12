from core.models import EnteredSource
from django.core.management.base import BaseCommand, CommandError
from ingestion.rss import ingest_rss_source


class Command(BaseCommand):

    help = ('Adds RSS feeds to EnteredSource (if not already there) '
            'and performs a one-time poll of a RSS feed!')

    def add_arguments(self, parser):
        parser.add_argument('url')

    def handle(self, *args, **options):
        url = options['url']
        entered_source = EnteredSource.objects.filter(url=url,
                                                      source_type=EnteredSource.TYPE_RSS).first()

        if entered_source is not None:
            print("Already ingested this URL with EnteredSource id: {}".format(entered_source.id))
        else:
            entered_source = EnteredSource.objects.create(source_type=EnteredSource.TYPE_RSS,
                                                          url=url, last_error=None)
            results = ingest_rss_source(entered_source)

            if 'error' in results:
                raise CommandError(results['error'])
            else:
                print(results)
