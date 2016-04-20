from django.core.management.base import BaseCommand
from text.common import LDA_DATA_DIR
from core.s3 import sync_lda_from_s3
import boto3
import logging

boto3.set_stream_logger(level=logging.INFO)


class Command(BaseCommand):
    help = ('Fetch LDA dict/model/index files from s3')

    def handle(self, *args, **options):
        sync_lda_from_s3(LDA_DATA_DIR)
