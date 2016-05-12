from requests import get
from django.conf import settings
from core.models import Publisher, PublisherURL, EnteredSource, Content, Issue
from ingestion.util import IngestionItem
from datetime import datetime, timezone


def ingest(source_id):
    entered_source = EnteredSource.objects.filter(id=source_id).first()
    if entered_source is not None:
        return ingest_source(entered_source)
    else:
        return {'error': "Entered Source object with id {} doesn't exist".format(source_id)}


def ingest_source(entered_source):
    if entered_source.source_type != EnteredSource.TYPE_PAGE:
        return {"error": "Source is not a PAGE TYPE"}
    url = entered_source.url
    existing_content = Content.objects.filter(url=url).first()
    if existing_content is not None:
        return {'exists': [IngestionItem(existing_content.id, url)]}

    payload = {
        'key': settings.EMBEDLY_KEY,
        'url': url
    }
    resp = get('https://api.embedly.com/1/extract', params=payload)
    if (resp.status_code == 200):
        response = resp.json()
    else:
        entered_source.save(update_fields={
            'last_error': "HTTP response {} {}".format(resp.status_code, resp.reason),
            'last_polled': datetime.now(timezone.utc)
        })
        Issue.create(
            source="ingestion.content#ingest_source", #  XXX Trying to make this more automatic
            error_code=Issue.ERROR_RETRIEVAL,
            object_type="EnteredSource",
            object_id=entered_source.id,
            other={"status_code": resp.status_code, "reason": resp.reason, "url": url}
        )

        return {"error": "Got response {} {}".format(resp.status_code, resp.reason)}
    return _create_content(response, entered_source)

def _create_content(response, entered_source, complete_processing=True):
    provider_url = response['provider_url']
    content_url = response['url']

    # Check to see if the canonical URL from embedly already has been retrieved
    existing_content = Content.objects.filter(url=content_url).first()
    if existing_content is not None:
        return {'exists': [IngestionItem(existing_content.id, url)]}

    # See if the Publisher exists, look up by publisher url
    publisher_url = PublisherURL.objects.filter(url=provider_url).first()
    if publisher_url is None:
        # I guess we assume if there's no matching publisher_url, there's no publisher?
        publisher = Publisher.objects.create(name=response['provider_display'])
        publisher_url = PublisherURL.objects.create(publisher=publisher, url=provider_url)
    else:
        publisher = publisher_url.publisher

    content = Content.objects.create(entered_source=entered_source,
                                     url=content_url,
                                     extract=response,
                                     publisher=publisher)
    if complete_processing:
        content.add_to_search_index()
        content.add_to_s3()
    entered_source.save(update_fields={
        'last_error': None,
        'last_polled': datetime.now(timezone.utc)
    })

    return({'success': [IngestionItem(content.id, content_url)]})

def import_source(import_data, complete_processing=False):
    '''
    Probably only use this for testing & dev
    Load content from file content that are pushed to s3 by
    Content.add_to_s3
    '''

    response = import_data['extract']
    content_url = response['url']
    existing_content = Content.objects.filter(url=content_url).first()
    if existing_content is not None:
        return {'exists': [IngestionItem(existing_content.id, content_url)]}

    entered_source, _ = EnteredSource.objects.get_or_create(
        url = content_url,
        source_type = EnteredSource.TYPE_IMPORTED_PAGE)

    return _create_content(response, entered_source, complete_processing=complete_processing)
