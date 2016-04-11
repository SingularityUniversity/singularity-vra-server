from celery import shared_task
from ingestion.rss import ingest_rss
from ingestion.content import ingest

@shared_task
def test(param):
    return 'The test task executed with argument "{}" '.format(param)


@shared_task
def add_rss(rss_url):
    return ingest_rss(rss_url)


@shared_task
def add_content(url):
    return ingest(url)
