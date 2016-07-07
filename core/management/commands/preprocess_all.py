from django.core.management.base import BaseCommand
from django.core.paginator import Paginator
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

        contents = Content.objects.all().order_by('id')
        n=250
        with tqdm(total=contents.count()) as pbar:
            paginator = Paginator(contents, n)
            for page_number in paginator.page_range:
                next_contents = paginator.page(page_number).object_list
                for content in next_contents:
                    content.save()
                pbar.update(len(next_contents))

        self.stdout.write(self.style.SUCCESS("Re-preprocessed all documents"))
