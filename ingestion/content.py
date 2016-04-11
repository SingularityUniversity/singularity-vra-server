from requests import get
from django.conf import settings
from core.models import Publisher, PublisherURL, EnteredSource, Content
from ingestion.util import IngestionItem

def ingest(url):
    payload = {
        'key': settings.EMBEDLY_KEY,
        'url': url
    }

    resp = get('https://api.embedly.com/1/extract', params=payload)
    if (resp.status_code == 200):
        response = resp.json()
    else:
        raise(RuntimeError("Got response {} {}".format(resp.status_code, resp.reason)))

    provider_url = response['provider_url']
    content_url = response['url']

    entered_source = EnteredSource.objects.filter(url=content_url,
                                                  source_type=EnteredSource.TYPE_PAGE).first()
    existing_content = Content.objects.filter(url=content_url).first()
    if entered_source is None and existing_content is None:
        # See if the Publisher exists, look up by publisher url
        publisher_url = PublisherURL.objects.filter(url=provider_url).first()
        if publisher_url is None:
            # I guess we assume if there's no matching publisher_url, there's no publisher?
            publisher = Publisher.objects.create(name=response['provider_display'])
            publisher_url = PublisherURL.objects.create(publisher=publisher, url=provider_url)
        else:
            publisher = publisher_url.publisher
        entered_source = EnteredSource.objects.create(source_type=EnteredSource.TYPE_PAGE,
                                                      publisher=publisher,
                                                      url=content_url)
        content = Content.objects.create(entered_source=entered_source,
                                         url=content_url,
                                         extract=response)
        return({'success': [IngestionItem(content.id, content_url)]})
    else:
        return({'exists': [IngestionItem(existing_content.id, content_url)]})
