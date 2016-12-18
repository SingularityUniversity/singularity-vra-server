import traceback
import json
import logging
from datetime import datetime
import numpy as np
from django.conf import settings
from rest_framework import viewsets, status, views
from core.models import *
from core.api.v1.serializers import *
from core.elasticsearch import get_client, ElasticException
from rest_framework.decorators import detail_route, list_route
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from text.common import get_lda_data, tokenize_text_block, extract_words_from_content
from text.summary import get_summary_sentences
from core.api.v1.pagination import LargeResultsLimitOffsetPagination
from elasticsearch import TransportError, RequestError
from django.http import HttpResponse

logger = logging.getLogger(__name__)


class PublisherViewSet(viewsets.ModelViewSet):
    queryset = Publisher.objects.all()
    serializer_class = PublisherSerializer


def get_es_results(index, doc_type, search_params, from_=0, size=None):
    client = get_client()
    param_dict = {}
    param_dict['index'] = index
    param_dict['doc_type'] = doc_type
    param_dict['body'] = search_params
    param_dict['from_'] = from_
    if size is not None:
        param_dict['size'] = size
    results = None
    try:
        results = client.search(**param_dict)
    except RequestError as req_err:
        if (req_err.info):
            message = req_err.info['error']['root_cause'][0]['reason']
        else:
            message = str(req_err)
        raise ElasticException(message)
    except TransportError as req_err:
        raise ElasticException("Transport error with Elastic Search")
    return results


class SearchView(views.APIView):
    query_fields = {
        'url': 'fields.url',
        'title': 'fields.extract.title',
        'author': 'fields.extract.authors.name',
        'language': 'fields.extract.language',
        'content': 'fields.extract.content',
        'keyword': 'fields.extract.keywords.name',
        'publisher': 'fields.extract.provider_name',
        'published': 'fields.extract.published'
    }

    def map_query_to_fields(self, query):
        tokens = query.split()
        in_quote = False
        in_quote_with_field = False
        # walk through the tokens consuming anything inside of double quotes
        for index, token in enumerate(tokens):
            if in_quote_with_field == False and in_quote == False and \
                    '"' in token and token.count('"') > 1:
                # one messed up search token with multiple quotes and no spaces
                # try to deal with it...
                if ':' in token and token.find('"') < token.find(':'):
                    # if there is a ':' inside the quoted string, just ignore it
                    continue
            elif in_quote_with_field == False and in_quote == False and \
                    '"' in token and ':' in token:
                # we're looking at a field followed by a quoted string
                in_quote_with_field = True
            elif (in_quote == True or in_quote_with_field == True) \
                    and '"' in token:
                # matched closing quote
                in_quote = False
                in_quote_with_field = False
                continue
            elif in_quote == False and '"' in token:
                # matched opening quote
                in_quote = True
                continue
            elif (in_quote == True or in_quote_with_field == True) and \
                    '"' not in token:
                # gobble tokens inside of quotes
                continue
            # replace any fields with the underlying data model field name (only
            # the first instance though...)
            for field in self.query_fields:
                if field in token:
                    tokens[index] = token.replace(field, self.query_fields[field], 1)
                    break
        #print(' '.join(tokens))
        return ' '.join(tokens)

    def get(self, request, *args, **kwargs):
        query_params = request.query_params
        client = get_client()
        index = settings.ELASTICSEARCH_INDEX
        if index is None:
            raise ValueError("settings.ELASTICSEARCH_INDEX is None")

        # These should only have single values
        param_dict = {key:query_params[key] for key in query_params
                      if key not in ['limit', 'offset', 'order']}

        for key in ('_source_include', '_source_exclude'):
            if key in param_dict:
                param_dict[key]=param_dict[key].split(',')

        from_ = 0
        if 'offset' in query_params:
            from_ = query_params['offset']
        size = LargeResultsLimitOffsetPagination.default_limit
        if 'limit' in query_params:
            size = query_params['limit']
        order = "+relevance"
        if 'order' in query_params:
            order = query_params['order']
            if order[0] == ' ':
                order = '+' + order[1:]  # A hack to allow use of ' ' -> '+'
        if order[0] not in ('-', '+'):
            order = "+"+order

        if order[1:] == "relevance":
            # The score boost function is
            # score * (1+sigmoid((content_length-300)/100))
            search_params = {
                "query": {
                    "function_score": {
                        "query": {
                            "query_string": {"query":self.map_query_to_fields(param_dict['q'])}
                        },
                        "functions": [
                            {
                                "script_score": {
                                    "script" : "_score * (1 + (1/(1+Math.exp(-((doc.content_length.value-300) / 100.0)))))"
                                }
                            }
                        ]
                    }
                },
                "sort": {
                    "_score": {"order": "asc" if order[0] == "+" else "desc" }
                }
            }
        elif order[1:] == "published":
            search_params = {
                "query": {
                    "query_string": {"query":self.map_query_to_fields(param_dict['q'])}
                },
                "sort": {
                    "fields.extract.published": {"order": "asc" if order[0] == "+" else "desc"}
                }
            }
        else:  # order[1:] == "added" or anything else
            search_params = {
                "query": {
                    "query_string": {"query":self.map_query_to_fields(param_dict['q'])}
                },
                "sort": {
                    "fields.created": {"order": "asc" if order[0] == "+" else "desc"}
                }
            }

        results = get_es_results(index, settings.ELASTICSEARCH_TYPE,
                                 search_params, from_=from_, size=size)

        # store successful searchs
        index_search_stats = settings.ELASTICSEARCH_SEARCH_STATS_INDEX
        if index_search_stats is None:
            raise ValueError("settings.ELASTICSEARCH_SEARCH_STATS_INDEX is None")
        q =  self.map_query_to_fields(param_dict['q']).split()
        q_lower = []
        for keyword in q:
            if keyword not in ['AND', 'OR', 'NOT']:
                q_lower.append(keyword.lower())
            else:
                q_lower.append(keyword)
        client.index(index=index_search_stats, doc_type='q', body={
            'query': ' '.join(q_lower),
            'user_id': request.user.id,
            'timestamp': arrow.utcnow().timestamp,
            'result_count': results['hits']['total']
        })
        return Response(results, status=status.HTTP_200_OK)


class SearchStatsView(views.APIView):
    def get(self, request, *args, **kwargs):
        query_params = request.query_params
        index_search_stats = settings.ELASTICSEARCH_SEARCH_STATS_INDEX
        if index_search_stats is None:
            raise ValueError("settings.ELASTICSEARCH_SEARCH_STATS_INDEX is None")
        count = 5
        if 'count' in request.query_params:
            count = int(request.query_params['count'])

        # Top results
        search_params = {
            "aggs": {
                "group_by_query": {
                    "terms": {
                        "field": "query"
                    },
                }
            }
        }
        results = get_es_results(index_search_stats, 'q', search_params, size=0)

        retval = {}
        retval['top'] = [{'query': result['key'] , 'count':result['doc_count'] } for
                         result in results['aggregations']['group_by_query']['buckets'][:count]]

        # XXX: Turn this into a multisearch?  Also, the other two queries
        # (recent and top) could both be in the same multisearch.
        for i, query in enumerate(retval['top']):
            search_params = {
                'query': {'match': {'query': query['query']}},
                'sort': [{'timestamp': 'desc'}]
            }
            results = get_es_results(index_search_stats, 'q', search_params, size=1)
            retval['top'][i]['timestamp'] = results['hits']['hits'][0]['_source']['timestamp']
            retval['top'][i]['result_count'] = results['hits']['hits'][0]['_source']['result_count']

        search_params = {
            'query': {'match_all': {}},
            'sort': [{'timestamp': 'desc'}]
        }
        results = get_es_results(index_search_stats, 'q', search_params, size=count)

        retval['recent'] = [{'query': result['_source']['query'],
                             'timestamp': result['_source']['timestamp'] ,
                             'result_count': result['_source']['result_count'] } for
                            result in results['hits']['hits'][:count]]

        return Response(retval, status=status.HTTP_200_OK)


class LDAView(views.APIView):
    permission_classes = []
    def post(self, request, *args, **kwargs):
        data = request.data
        # XXX: check for correct type -- int
        since_timestamp = data.get('since')
        if since_timestamp is not None:
            since_timestamp = int(since_timestamp)
        if 'text' in data:
            text = data['text']
            result = get_lda_results(tokenize_text_block(text), since_timestamp)
        elif 'ids' in data:
            ids = data['ids']
            words = []
            for pk in ids:
                content = get_object_or_404(Content, pk=int(pk))
                words.extend(extract_words_from_content(content))
            result = get_lda_results(words, since_timestamp)

        return Response(result, status=status.HTTP_200_OK)

def _extract_lda_result_from_content(match_content, weight):
    ndict, lda_model, lda_sims, id_map = get_lda_data()

    match_words = extract_words_from_content(match_content)
    match_bow = ndict.doc2bow(match_words)
    match_terms = lda_model[match_bow]
    match_lda_topics = [(describe_topic(key), weight) for (key, weight) in match_terms]
    match_lda_topics.sort(key=lambda x: -x[1])
    new_result = {
        'id': match_content.id,
        'title': match_content.extract['title'],
        'url': match_content.url,
        'topics': match_lda_topics,
        'source': match_content.as_json_serializable(),
        'weight': weight
    }
    return new_result

def describe_topic(topic_id):
    ndict, lda_model, lda_sims, id_map = get_lda_data()
    result = [(topic, weight) for (topic, weight) in lda_model.show_topic(topic_id)]
    result.sort(key=lambda x: -x[1])
    return result

def get_lda_results(text_tokens, since_timestamp=None):
    ndict, lda_model, lda_sims, id_map = get_lda_data()
    bow = ndict.doc2bow(text_tokens)
    vec_lda = lda_model[bow]


    doc_topics = [(describe_topic(topic), weight) for (topic, weight) in vec_lda]
    doc_topics.sort(key=lambda x: -x[1])

    matches = lda_sims[vec_lda]
    results = []

    if since_timestamp is None:
        ind = matches.argpartition(-10)[-10:]
        sorted_ind = ind[np.argsort(matches[ind])]
        sorted_matches = matches[sorted_ind[::-1]]  # ::-1 returns a reversed view/stride
        top_matches = list(zip(sorted_ind[::-1], sorted_matches))
        for match in top_matches:
            match_id = match[0]
            orig_id = id_map[match_id]
            match_content = Content.objects.filter(pk=orig_id).first()
            new_result = _extract_lda_result_from_content(match_content, match[1])
            results.append(new_result)
    else:
        ind = matches.argpartition(-100)[-100:]
        sorted_ind = ind[np.argsort(matches[ind])]
        sorted_matches = matches[sorted_ind[::-1]]  # ::-1 returns a reversed view/stride


        top_matches = list(zip(sorted_ind[::-1], sorted_matches))
        new_objects = (Content.objects.filter(id__in=[id_map[x[0]] for x in top_matches]).
                             filter(created__gt=arrow.get(since_timestamp).datetime)
                            [:10]
                       )
        for (index, match_object) in enumerate(new_objects):
            new_result = _extract_lda_result_from_content(match_object, top_matches[index][1])
            results.append(new_result)



    result = {
        'results': results,
        'query_topics': doc_topics
    }
    return result


class ContentViewSet(viewsets.ModelViewSet):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer

    @detail_route(methods=['get'])
    def similar(self, request, pk=None):
        content = get_object_or_404(Content, pk=int(pk))
        # XXX: Probably the REST handler shouldn't have this much in it, refactor me please
        ndict, lda_model, lda_sims, id_map = get_lda_data()

        # XXX: This is lousy, we really need a bidirectional (bijective)
        # structure for mapping lda ids to and *from* content object ids
        doc_lda_id = None
        for (index, value) in enumerate(id_map):
            if value == int(pk):
                doc_lda_id = index
                break

        if doc_lda_id is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        # If we stored the bow in s3 as part of the rest of the data, we wouldn't
        # have to extact the bow from the content we have, but not much extra work
        # and its generalizable to any new content, in addition to existing content
        text_tokens = extract_words_from_content(content)
        result = get_lda_results(text_tokens)

        return Response(result, status=status.HTTP_200_OK)

    @list_route(methods=['get'])
    def count(self, request):
        return Response({'count': Content.objects.count()})


class EnteredSourceViewSet(viewsets.ModelViewSet):
    queryset = EnteredSource.objects.all()
    serializer_class = EnteredSourceSerializer


class PublisherNestedViewSet(viewsets.ModelViewSet):
    def list(self, request, publisher_pk=None):
        models = [self.serializer_class(model).data for model in
                  self.queryset.filter(publisher=publisher_pk)]
        return Response(models)

    def create(self, request, publisher_pk=None):
        data = QueryDict(mutable=True)
        data.update(request.data)
        data.update({'publisher': publisher_pk})
        serializer = self.serializer_class(data=data, context={'publisher_pk':
                                                               publisher_pk})
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data,
                            status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PublisherPublisherURLViewSet(PublisherNestedViewSet):
    queryset = PublisherURL.objects.all()
    serializer_class = PublisherURLSerializer


class PublisherEnteredSourceViewSet(PublisherNestedViewSet):
    queryset = EnteredSource.objects.all()
    serializer_class = EnteredSourceSerializer


class EnteredSourceNestedViewSet(viewsets.ModelViewSet):
    def list(self, request, enteredsource_pk=None):
        models = [self.serializer_class(model).data for model in
                  self.queryset.filter(enteredsource=enteredsource_pk)]
        return Response(models)

    def create(self, request, enteredsource_pk=None):
        data = QueryDict(mutable=True)
        data.update(request.data)
        data.update({'enteredsource': enteredsource_pk})
        serializer = self.serializer_class(data=data, context={'enteredsource_pk':
                                                               enteredsource_pk})
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data,
                            status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EnteredSourceContentViewSet(EnteredSourceNestedViewSet):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer


class WorkspaceViewSet(viewsets.ModelViewSet):
    serializer_class = WorkspaceSerializer

    def get_queryset(self):
        return Workspace.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        # self.perform_create(serializer)
        if 'id' in request.data:
            # XXX: check for correct type -- int
            article = get_object_or_404(Content, pk=request.data['id']['id'])
            workspace_article = WorkspaceArticle(article=article,
                                                 workspace=instance,
                                                 date_added=arrow.get(request.data['id']['date_added']).datetime,
                                                 favorite=request.data['id']['favorite'])
            workspace_article.save()
        elif 'ids' in request.data:
            # XXX: check for correct type -- list
            for id in request.data['ids']:
                article = get_object_or_404(Content, pk=id['id'])
                workspace_article = WorkspaceArticle(article=article,
                                                     workspace=instance,
                                                     date_added=arrow.get(id['date_added']).datetime,
                                                     favorite=id['favorite'])
                workspace_article.save()
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update_workspace(self, ids):
        instance = self.get_object()
        articles = list(instance.articles.all())
        # delete articles that should be removed
        for article in articles:
            if article.pk not in [id['id'] for id in ids]:
                WorkspaceArticle.objects.filter(workspace=instance).filter(
                    workspace=instance, article=article).delete()
        for id in ids:
            article = Content.objects.get(pk=id['id'])
            if id['id'] not in [article.pk for article in articles]:
                # add new articles
                workspace_article = WorkspaceArticle(article=article,
                                                     workspace=instance,
                                                     date_added=arrow.get(id['date_added']).datetime,
                                                     favorite=id['favorite'])
                workspace_article.save()
            else:
               # update favorite as necessary on existing articles
               workspace_article = WorkspaceArticle.objects.get(article=article,
                                                                workspace=instance)
               if id['favorite'] != workspace_article.favorite:
                   workspace_article.favorite = id['favorite']
                   workspace_article.save()


    def partial_update(self, request, pk=None):
        instance = self.get_object()
        if 'id' in request.data:
            # XXX: check for correct type -- int
            self.update_workspace([request.data['id']])
            request.data.pop('id')
        elif 'ids' in request.data:
            # XXX: check for correct type -- list
            self.update_workspace(request.data['ids'])
            request.data.pop('ids')
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @detail_route(methods=['POST'])
    def add(self, request, pk=None):
        workspace = get_object_or_404(Workspace, pk=int(pk))
        if workspace.user.id != self.request.user.id:
            return Response('Not authorized.', status=status.HTTP_403_FORBIDDEN)
        if 'id' in request.data:
            # XXX: check for correct type -- int
            article = get_object_or_404(Content, pk=request.data['id']['id'])
            if not WorkspaceArticle.objects.filter(workspace=workspace).filter(article=article).exists():
                workspace_article = WorkspaceArticle(article=article,
                                                     workspace=workspace,
                                                     date_added=arrow.get(request.data['id']['date_added']).datetime,
                                                     favorite=request.data['id']['favorite'])
                workspace_article.save()
        elif 'ids' in request.data:
            # XXX: check for correct type -- list
            articles = [get_object_or_404(Content, pk=id['id']) for id in request.data['ids']]
            for id in request.data['ids']:
                article = get_object_or_404(Content, pk=id['id'])
                if not WorkspaceArticle.objects.filter(workspace=workspace).filter(article=article).exists():
                    workspace_article = WorkspaceArticle(article=article,
                                                         workspace=workspace,
                                                         date_added=arrow.get(id['date_added']).datetime,
                                                         favorite=id['favorite'])
                    workspace_article.save()
        return Response('Success', status=status.HTTP_204_NO_CONTENT)

    @detail_route(methods=['POST'])
    def remove(self, request, pk=None):
        workspace = get_object_or_404(Workspace, pk=int(pk))
        if workspace.user.id != self.request.user.id:
            return Response('Not authorized.', status=status.HTTP_403_FORBIDDEN)
        if 'id' in request.data:
            # XXX: check for correct type -- int
            article = get_object_or_404(Content, pk=request.data['id'])
            workspace_article_queryset = WorkspaceArticle.objects.filter(workspace=workspace).filter(article=article)
            if workspace_article_queryset.count() > 0:
                workspace_article_queryset.first().delete()
        elif 'ids' in request.data:
            # XXX: check for correct type -- list
            for article in [get_object_or_404(Content, pk=id) for id in request.data['ids']]:
                workspace_article_queryset = WorkspaceArticle.objects.filter(workspace=workspace).filter(article=article)
                if workspace_article_queryset.count() > 0:
                    workspace_article_queryset.first().delete()
        return Response('Success', status=status.HTTP_204_NO_CONTENT)
