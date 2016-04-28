from django.core.management.base import BaseCommand
from core.models import Content
import sys
from core.elasticsearch import bulk_index_documents
from tqdm import tqdm

class Command(BaseCommand):

    help = ('Reindexes all documents. Does not remove existing documents, but rather overwrites by index')

    def handle(self, *args, **options):
        confirm = None
        while confirm not in ('y', 'Y'):
            confirm = input("Do you want to reindex all content in elasticsearch (y/N): ")
            if confirm in ('n', 'N', ''):
                sys.exit(0)

        contents = Content.objects.all()
        total = 0
        n = 50
        with tqdm(total=contents.count()) as pbar:
            for chunk in [contents[i:i+n] for i in range(0, contents.count(), n)]:
                bulk_index_documents(chunk)
                pbar.update(len(chunk))

        self.stdout.write(self.style.SUCCESS("Recreated elasticsearch index"))
