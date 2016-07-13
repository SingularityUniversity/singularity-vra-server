from django.core.management.base import BaseCommand
from core.elasticsearch import create_query_index


class Command(BaseCommand):
    help = ('Creates query index and adds required mappings')

    def handle(self, *args, **options):
        result = create_query_index()
        if result[0] is True:
            self.stdout.write(self.style.SUCCESS(result[1]))
        else:
            self.stdout.write(self.style.ERROR(result[1]))
