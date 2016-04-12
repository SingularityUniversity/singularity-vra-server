from django.conf import settings
from requests import get
from core.models import Publisher, PublisherURL, EnteredSource, Content
import feedparser
from datetime import datetime, timezone
import logging
from ingestion.util import IngestionItem

# Get an instance of a logger
logger = logging.getLogger(__name__)


def ingest_rss(source_id):
    entered_source = EnteredSource.objects.filter(id=source_id).first()
    if entered_source is not None:
        return ingest_rss_source(entered_source)
    else:
        return {'error': "Entered Source object with id {} doesn't exist".format(source_id)}


def ingest_rss_source(entered_source):

        # XXX: Should we canonicalize the RSS URL? Can we?

        # Check to see if the RSS feed is already in the system, if not, grab it and insert it

        # XXX: Maybe we should do fuzzy matching on existing RSS URLs in the system

    if entered_source.source_type != EnteredSource.TYPE_RSS:
        return {'error': "Unable to find feed link!"}
    url = entered_source.url

    # Grab the URL and make sure we don't have an error
    feed_content = feedparser.parse(url)
    if 'link' in feed_content.feed:
        raw_publisher_url = feed_content.feed.link
    else:  # Cause an error?
        return {'error': "Unable to find feed link!"}

    publisher_url = PublisherURL.objects.filter(url=raw_publisher_url).first()
    if publisher_url is None:
        # XXX: No good way to get publisher name for now
        publisher = Publisher.objects.create(name=raw_publisher_url)
        publisher_url = PublisherURL.objects.create(publisher=publisher,
                                                    url=raw_publisher_url)

    skipped = []
    ingested = []
    for entry in feed_content.entries:
        if 'link' not in entry:
            logger.info("Ut-oh, we have a problem! {}".format(entry))
        else:
            logger.warn("Looking to see if we already have url {}".format(entry.link))
            existing_content = Content.objects.filter(url=entry.link).first()
            if existing_content is not None:
                skipped.append(IngestionItem(existing_content.id, entry.link))
                continue
            payload = {
                'key': settings.EMBEDLY_KEY,
                'url': entry.link
            }

            resp = get('https://api.embedly.com/1/extract', params=payload)
            if (resp.status_code == 200):
                response = resp.json()
            else:
                return {'error': "Got response {} {} for {}".format(
                    resp.status_code, resp.reason, entry.link)}
            content = Content.objects.create(entered_source=entered_source,
                                             url=response['url'],
                                             extract=response)
            ingested.append(IngestionItem(content.id, response['url']))
            logger.info("Successfully create content obj {} from URL {}".format(
                content.id, response['url']))

    entered_source.publisher = publisher_url.publisher
    entered_source.last_polled = datetime.now(timezone.utc)
    entered_source.last_error = None
    entered_source.save()
    return ({'success': ingested, 'exists': skipped})
