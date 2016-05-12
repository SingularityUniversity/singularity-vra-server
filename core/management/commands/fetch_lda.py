from django.core.management.base import BaseCommand, CommandError
from text.common import LDA_DATA_DIR
from core.s3 import sync_lda_from_s3
from core.models import Issue
import boto3
import logging
import traceback

boto3.set_stream_logger(level=logging.INFO)


class Command(BaseCommand):
    help = ('Fetch LDA dict/model/index files from s3')

    def handle(self, *args, **options):
        try:
            sync_lda_from_s3(LDA_DATA_DIR)
        except Exception as e:
            Issue.objects.create(
                source="core.management.commands.fetch_lda#Command.handle",
                error_code=Issue.ERROR_EXCEPTION,
                other={"traceback": traceback.format_exc()})
            raise CommandError(e)
