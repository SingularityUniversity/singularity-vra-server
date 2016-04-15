from django.core.management.base import BaseCommand
from core.s3 import get_ids_at_s3
from core.models import Content
from tqdm import tqdm


class Command(BaseCommand):
    help = ('Upload documents to s3 that might not have been uploaded. This can take a LONG time.')

    def handle(self, *args, **options):
        content_ids = set(Content.objects.values_list('id', flat=True))

        s3_ids = set(get_ids_at_s3())

        to_push = content_ids - s3_ids

        self.stdout.write('{} items of content not pushed to s3'.format(len(to_push)))

        for content_id in tqdm(to_push):
            content = Content.objects.get(id=content_id)
            content.add_to_s3()
