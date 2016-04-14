from core.models import EnteredSource
from django.core.management.base import BaseCommand, CommandError
from ingestion.rss import ingest_rss_source


class Command(BaseCommand):

    help = ('Adds RSS feeds to EnteredSource (if not already there) '
            'and performs a one-time poll of a RSS feed!')

    def add_arguments(self, parser):
        parser.add_argument('url')

    def handle(self, *args, **options):
        url = options['url']
        entered_source = EnteredSource.objects.filter(url=url).exclude(
        source_type=EnteredSource.TYPE_PAGE).first()
        current_entered_source = EnteredSource.objects.filter(
            source_type=EnteredSource.TYPE_RSS).first()
        if entered_source is not None:
            # we have a match on URL, so determine if this is active or archived
            if entered_source.source_type == EnteredSource.TYPE_RSS:
                # active, so don't do anything...
                self.stdout.write(self.style.SUCCESS(
                    "EnteredSource with URL {} is currently active".format(
                        entered_source.url)))
                return
            elif entered_source.source_type == EnteredSource.TYPE_ARCHIVED_RSS:
                # archive whatever is currently active and make this entered
                # source the active one
                if current_entered_source is not None:
                    self.stdout.write(
                        self.style.SUCCESS(
                            'Archiving EnteredSource with id: {}'.format(
                                current_entered_source.id)))
                    current_entered_source.source_type = EnteredSource.TYPE_ARCHIVED_RSS
                    current_entered_source.save()
                self.stdout.write(
                    self.style.SUCCESS(
                        'Activating EnteredSource with id: {}'.format(
                            entered_source.id)))
                entered_source.source_type = EnteredSource.TYPE_RSS
                entered_source.save()
        else:
            # no matching URL, so do we have an active rss entered source?
            if current_entered_source is not None:
                self.stdout.write(self.style.SUCCESS(
                    "Archiving URL with EnteredSource id: {}".format(
                        current_entered_source.id)))
                current_entered_source.source_type = EnteredSource.TYPE_ARCHIVED_RSS
                current_entered_source.save()

            # now create the new entered source
            entered_source = EnteredSource.objects.create(source_type=EnteredSource.TYPE_RSS,
                                                            url=url, last_error=None)
        results = ingest_rss_source(entered_source)

        if 'error' in results:
            raise CommandError(results['error'])
        else:
            self.stdout.write(self.style.SUCCESS(results))
