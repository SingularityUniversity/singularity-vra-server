from django.core.management.base import BaseCommand
from core.elasticsearch import create_query_index


class Command(BaseCommand):
    help = ('Creates query index and adds required mappings')

    def handle(self, *args, **options):
        result = create_query_index()
        if result is True:
            self.stdout.write(self.style.SUCCESS("Index and mappings created"))
        else:
            self.stdout.write("Unable to create index.  Does it already exist?")
