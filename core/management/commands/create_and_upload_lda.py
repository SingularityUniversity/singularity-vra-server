from django.core.management.base import BaseCommand, CommandError
from text.common import make_and_store
from core.s3 import sync_lda_to_s3
from core.models import Issue
import boto3
import logging
import shutil
import traceback

boto3.set_stream_logger(level=logging.INFO)


class Command(BaseCommand):
    help = ('Cretea and upload LDA dict/model/index files to s3')

    def handle(self, *args, **options):
        try:
            temp_dir, *_ = make_and_store()
            sync_lda_to_s3(temp_dir)
            shutil.rmtree(temp_dir)
        except Exception as e:
            Issue.objects.create(
                source="core.management.commands.create_and_upload_lda#Command.handle",
                error_code=Issue.ERROR_EXCEPTION,
                other={"traceback": traceback.format_exc()})
            raise CommandError(e)

