from django.core.management.base import BaseCommand, CommandError
from core.models import EnteredSource

from ingestion.content import ingest_source


class Command(BaseCommand):
    help = 'Adds Pulls in a single content URL!'

    def add_arguments(self, parser):
        parser.add_argument('url')

    def handle(self, *args, **options):
        url = options['url']

        entered_source = EnteredSource.objects.filter(url=url,
                                                      source_type=EnteredSource.TYPE_PAGE).first()

        if entered_source is not None:
            print("Already ingested this URL with EnteredSource id: {}".format(entered_source.id))
        else:
            entered_source = EnteredSource.objects.create(source_type=EnteredSource.TYPE_PAGE,
                                                          url=url, last_error=None)
            result = ingest_source(entered_source)
            if 'error' in result:
                raise CommandError(result['error'])

            if 'success' in result:
                print("Successfully retrieved document, id: {}".format(result['success'][0]))
            else:
                print("Document already retrieved, id: {}".format(result['exists'][0]))
