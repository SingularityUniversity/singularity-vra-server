from django.core.management.base import BaseCommand
from text.common import make_and_store
from core.s3 import sync_lda_to_s3
import boto3
import logging
import shutil

boto3.set_stream_logger(level=logging.INFO)


class Command(BaseCommand):
    help = ('Cretea and upload LDA dict/model/index files to s3')

    def handle(self, *args, **options):
        temp_dir, *_ = make_and_store()
        sync_lda_to_s3(temp_dir)
        shutil.rmtree(temp_dir)
