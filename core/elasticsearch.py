from django.conf import settings
from elasticsearch import Elasticsearch, helpers
from threading import Lock
import json
import sys
import os.path

_es = None
_lock = Lock()


def get_client():
    global _es, _lock
    with _lock:
        if _es is None:
            url = settings.ELASTICSEARCH_URL
            if url is None:
                raise ValueError("settings.ELASTICSEARCH_URL is None")
            # XXX Hack, we shouldn't have to do this - but on heroku python buildpack, we do
            if sys.platform == 'linux' and os.path.isfile('/etc/ssl/certs/ca-certificates.crt'):
                ca_certs = '/etc/ssl/certs/ca-certificates.crt'
            else:
                ca_certs = None
            _es = Elasticsearch([settings.ELASTICSEARCH_URL], verify_certs=True, ca_certs=ca_certs)
    return _es


def index_document(document, doc_id, doc_type=settings.ELASTICSEARCH_TYPE):
    client = get_client()

    index = settings.ELASTICSEARCH_INDEX
    if index is None:
        raise ValueError("settings.ELASTICSEARCH_INDEX is None")
    client.index(index=index,
                 doc_type=doc_type,
                 id=int(doc_id),
                 body=document)


def bulk_index_documents(documents, doc_type=settings.ELASTICSEARCH_TYPE):
    client = get_client()

    index = settings.ELASTICSEARCH_INDEX
    if index is None:
        raise ValueError("settings.ELASTICSEARCH_INDEX is None")

    actions = [
        {'_type': doc_type, '_op_type': 'index', '_index': index,
         '_id': int(doc.id), '_source': doc.as_json()} for doc in documents]

    result = helpers.bulk(client, actions)
    return result

def delete_index():
    index = settings.ELASTICSEARCH_INDEX
    if index is None:
        raise ValueError("settings.ELASTICSEARCH_INDEX is None")
    client = get_client()
    client.indices.delete(index=index, ignore=404)
