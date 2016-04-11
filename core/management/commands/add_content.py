from django.core.management.base import BaseCommand, CommandError

from ingestion.content import ingest


class Command(BaseCommand):
    help = 'Adds Pulls in a single content URL!'

    def add_arguments(self, parser):
        parser.add_argument('url')

    def handle(self, *args, **options):
        url = options['url']

        result = ingest(url)

        if 'success' in result:
            print("Successfully retrieved document, id: {}".format(result['success'][0]))
        else:
            print("Document already retrieved, id: {}".format(result['exists'][0]))
