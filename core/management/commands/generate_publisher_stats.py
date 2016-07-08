from django.core.management.base import BaseCommand
import sys
from text.readability import update_publisher_readability_stats

class Command(BaseCommand):

    help = ('Regenerate statistics for publishers')

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Calculating readability statistics for publishers"))
        update_publisher_readability_stats()
        self.stdout.write(self.style.SUCCESS("Done updating publisher statistics"))
