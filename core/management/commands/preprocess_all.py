from django.core.management.base import BaseCommand
from core.models import Content
import sys
from tqdm import tqdm

class Command(BaseCommand):

    help = ('Repeats preprocessing steps for all documents.')

    def handle(self, *args, **options):
        confirm = None
        while confirm not in ('y', 'Y'):
            confirm = input("Do you want to repreprocess all content (y/N): ")
            if confirm in ('n', 'N', ''):
                sys.exit(0)

        contents = Content.objects.all()
        count = contents.count()

        for content in tqdm(contents.iterator(), total=count, mininterval=2):
            content.save()

        self.stdout.write(self.style.SUCCESS("Re-preprocessed all documents"))
