from django.core.management.base import BaseCommand
from core.elasticsearch import delete_index
class Command(BaseCommand):

    help = ('Drops (deletes) the elasticsearch index of document. Be sure you mean to do this!')

    def handle(self, *args, **options):
        confirm = None
        while confirm not in ('y', 'Y'):
            confirm = input("Do you really want to drop the elasticsearch index (y/N): ")
            if confirm in ('n', 'N', ''):
                sys.exit(0)
        delete_index()
        self.stdout.write(self.style.SUCCESS("Elasticsearch Index is Removed"))

