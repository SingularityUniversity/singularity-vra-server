from django.conf import settings
from requests import get
from core.models import Publisher, PublisherURL, EnteredSource, Content, Issue
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

    skipped = []
    ingested = []
    errors = []
    for entry in feed_content.entries:
        if 'link' not in entry:
            logger.info("Ut-oh, we have a problem! {}".format(entry))
            Issue.objects.create(
                source="ingestion.rss#ingest_rss_source", #  XXX Trying to make this more automatic
                error_code=Issue.ERROR_MISSING_LINK,
                object_type="EnteredSource",
                object_id=entered_source.id,
                other={"entry":entry}
            )
        else:
            existing_content_by_url = Content.objects.filter(url=entry.link).first()
            if existing_content_by_url is not None:
                skipped.append(IngestionItem(existing_content_by_url.id, entry.link))
                continue
            if 'guid' in entry:
                existing_content_by_guid = Content.objects.filter(guid=entry.guid).first()
                if existing_content_by_guid is not None:
                    skipped.append(IngestionItem(existing_content_by_guid.id, entry.link))
                    continue

            payload = {
                'key': settings.EMBEDLY_KEY,
                'url': entry.link
            }

            resp = get('https://api.embedly.com/1/extract', params=payload)
            if (resp.status_code == 200):
                response = resp.json()
            else:
                entered_source.save(update_fields={
                    'last_error': "HTTP response {} {}".format(resp.status_code, resp.reason),
                    'last_polled': datetime.now(timezone.utc)
                })
                errors.append(
                    {'error': "response {} {}".format(resp.status_code, resp.reason),
                     'url': entry.link}
                )
                Issue.create(
                    source="ingestion.rss#ingest_rss_source", #  XXX Trying to make this more automatic
                    error_code=Issue.ERROR_RETRIEVAL,
                    object_type="EnteredSource",
                    object_id=entered_source.id,
                    other={"status_code": resp.status_code, "reason": resp.reason, "url": url}
                )
                continue
            provider_url = response['provider_url']
            content_url = response['url']

            # Check to see if the canonical URL from embedly already has been retrieved
            existing_content = Content.objects.filter(url=content_url).first()
            if existing_content is not None:
                skipped.append(IngestionItem(existing_content.id, entry.link))
                continue

            # See if the Publisher exists, look up by publisher url
            publisher_url = PublisherURL.objects.filter(url=provider_url).first()
            if publisher_url is None:
                # I guess we assume if there's no matching publisher_url, there's no publisher?
                publisher = Publisher.objects.create(name=response['provider_display'])
                publisher_url = PublisherURL.objects.create(publisher=publisher, url=provider_url)
            else:
                publisher = publisher_url.publisher

            content = Content.objects.create(entered_source=entered_source,
                                             url=response['url'],
                                             extract=response,
                                             publisher=publisher,
                                             guid=entry.guid if 'guid' in entry else None)
            if response.get('content') is None:
                Issue.objects.create(
                    source="ingestion.content#ingest_rss_source", #  XXX Trying to make this more automatic
                    error_code=Issue.ERROR_NO_CONTENT,
                    object_type="core.models.Content",
                    object_id=content.id,
                    other={"url": content.url}
                )

            content.add_to_search_index()
            content.add_to_s3()
            ingested.append(IngestionItem(content.id, response['url']))
            logger.info("Successfully create content obj {} from URL {}".format(
                content.id, response['url']))

    entered_source.last_polled = datetime.now(timezone.utc)
    entered_source.last_error = None
    entered_source.save()
    return ({'success': ingested, 'exists': skipped, 'errors': errors})


def refresh_rss():
    '''
    Refreshes the current RSS feed retrieved from the EnteredSource with type TYPE_RSS
    There should only be one of these.
    '''
    entered_source = EnteredSource.objects.filter(source_type=EnteredSource.TYPE_RSS).first()
    if entered_source is None:
        # XXX: Maybe return status or at least an exception with better metadata?
        raise ValueError("No entered_source with type TYPE_RSS")
    return ingest_rss_source(entered_source)
