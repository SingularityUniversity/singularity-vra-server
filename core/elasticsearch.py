from django.conf import settings
from rest_framework.exceptions import APIException
from elasticsearch import Elasticsearch, helpers
from threading import Lock
import json
import sys
import os.path
import certifi

_es = None
_lock = Lock()

class ElasticException(APIException):
    status_code = 400


def get_client():
    global _es, _lock
    with _lock:
        if _es is None:
            url = settings.ELASTICSEARCH_URL
            if url is None:
                raise ValueError("settings.ELASTICSEARCH_URL is None")
            _es = Elasticsearch([settings.ELASTICSEARCH_URL], verify_certs=True,
                                ca_certs=certifi.where())
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
         '_id': int(doc.id), '_source': doc.as_indexable_json()} for doc in documents]

    result = helpers.bulk(client, actions)
    return result

def delete_index():
    index = settings.ELASTICSEARCH_INDEX
    if index is None:
        raise ValueError("settings.ELASTICSEARCH_INDEX is None")
    client = get_client()
    client.indices.delete(index=index, ignore=404)


def create_query_index():
    index = settings.ELASTICSEARCH_SEARCH_STATS_INDEX
    if index is None:
        raise ValueError("settings.ELASTICSEARCH_SEARCH_STATS_INDEX is None")
    client = get_client()

    if client.indices.exists(index):
        return (False, 'Index already exists.  Delete it before running this command.')

    params = {
        'index': index,
        'body': {
            'mappings': {
                'q': {
                    'properties': {
                        'timestamp': {'type': 'long'},
                        'query': {
                            'type': 'string',
                            'index': 'not_analyzed'
                        }
                    }
                }
            }
        }
    }

    result = client.indices.create(**params)
    if 'acknowledged' in result and result['acknowledged'] is True:
        return (True, 'Index and mappings created')
    else:
        return (False, 'Unknown error.  Unable to create index.')
