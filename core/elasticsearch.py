from django.conf import settings
from elasticsearch import Elasticsearch
from threading import Lock

_es = None
_lock = Lock()


def get_client():
    global _es, _lock
    with _lock:
        if _es is None:
            url = settings.ELASTICSEARCH_URL
            if url is None:
                raise ValueError("settings.ELASTICSEARCH_URL is None")
            _es = Elasticsearch([settings.ELASTICSEARCH_URL])
    return _es


def index_document(document, doc_id, doc_type="content"):
    client = get_client()

    index = settings.ELASTICSEARCH_INDEX
    if index is None:
        raise ValueError("settings.ELASTICSEARCH_INDEX is None")
    client.index(index=index,
                 doc_type=doc_type,
                 id=doc_id,
                 body=document)
