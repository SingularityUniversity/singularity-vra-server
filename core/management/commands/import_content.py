from django.core.management.base import BaseCommand
from ingestion.content import import_source
import pathlib
import json
import sys

class Command(BaseCommand):
    help = ('Import documents as new documents (new ids) from json files (the ones uploaded to s3)')

    def add_arguments(self, parser):
        parser.add_argument('path', nargs='?', default='.', help="path under which to find json files")
        parser.add_argument('-P', '--process', action='store_true', dest='do_processing', help="do s3 upload, elasticsearch index, etc")

    def handle(self, *args, **options):
        file_path = options['path']
        do_processing = options['do_processing']

        confirm = None
        while confirm not in ('y', 'Y'):
            prompt = "Do you want to try to load content in into the db? {} (y/N): ".format(
                "(Including elasticsearch indexing, and s3 upload?)" if do_processing
                else "")
            confirm = input(prompt)
            if confirm in ('n', 'N', ''):
                sys.exit(0)

        files = pathlib.Path(file_path).rglob('*.json')

        exists = 0
        success = 0
        errors = 0
        counter = 1
        for json_file in files:
            with json_file.open() as json_input:
                data = json.load(json_input)
                result = import_source(data, complete_processing=do_processing)
                if 'errors' in result:
                    self.stdout.write(self.style.FAILURE("Error: {}".format(result['errors'])))
                    sys.exit(-1)
                if 'success' in result:
                    success += 1
                if 'exists'  in result:
                    exists += 1
            counter += 1

            if (counter % 100) == 0:
                self.stdout.write("Processed {} documents\n".format(counter))

        self.stdout.write(self.style.SUCCESS("success: {}, exists: {}".format(success, exists)))
        self.stdout.write(self.style.SUCCESS("You may want to reindex elasticsearch, blow away "
                                             "and sync to s3, and regenerate any other derived "
                                             "data"))
