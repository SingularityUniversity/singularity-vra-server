from django.conf import settings
import logging
from rest_framework import viewsets, status, views
from core.models import *
from core.api.v1.serializers import *
from core.elasticsearch import get_client
from rest_framework.decorators import detail_route, list_route
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from text.common import get_lda_data, tokenize_text_block, extract_words_from_content
from text.summary import get_summary_sentences
import numpy as np

logger = logging.getLogger(__name__)


class PublisherViewSet(viewsets.ModelViewSet):
    queryset = Publisher.objects.all()
    serializer_class = PublisherSerializer


class SearchView(views.APIView):
    def get(self, request, *args, **kwargs):
        query_params = request.query_params
        client = get_client()
        index = settings.ELASTICSEARCH_INDEX
        if index is None:
            raise ValueError("settings.ELASTICSEARCH_INDEX is None")

        # These should only have single values
        param_dict = {key:query_params[key] for key in query_params}

        for key in ('_source_include', '_source_exclude'):
            if key in param_dict:
                param_dict[key]=param_dict[key].split(',')

        param_dict['index'] = index
        param_dict['doc_type'] = settings.ELASTICSEARCH_TYPE
        results = client.search(**param_dict)

        return Response(results, status=status.HTTP_200_OK)


class LDAView(views.APIView):
    permission_classes = []
    def post(self, request, *args, **kwargs):
        data = request.data
        if 'text' in data:
            text = data['text']
            result = get_lda_results(tokenize_text_block(text))
        elif 'ids' in data:
            ids = data['ids']
            words = []
            for pk in ids:
                content = get_object_or_404(Content, pk=int(pk))
                words.extend(extract_words_from_content(content))
            result = get_lda_results(words)

        return Response(result, status=status.HTTP_200_OK)


def get_lda_results(text_tokens):
    ndict, lda_model, lda_sims, id_map = get_lda_data()
    bow = ndict.doc2bow(text_tokens)
    vec_lda = lda_model[bow]

    def describe_topic(topic_id):
        result = [(topic, weight) for (topic, weight) in lda_model.show_topic(topic_id)]
        result.sort(key=lambda x: -x[1])
        return result

    doc_topics = [(describe_topic(topic), weight) for (topic, weight) in vec_lda]
    doc_topics.sort(key=lambda x: -x[1])

    matches = lda_sims[vec_lda]
    ind = matches.argpartition(-10)[-10:]
    sorted_ind = ind[np.argsort(matches[ind])]
    sorted_matches = matches[sorted_ind[::-1]]  # ::-1 returns a reversed view/stride
    top_matches = list(zip(sorted_ind[::-1], sorted_matches))
    results = []

    for match in top_matches:

        match_id = match[0]
        orig_id = id_map[match_id]
        match_content = Content.objects.filter(pk=orig_id).first()
        match_words = extract_words_from_content(match_content)
        match_bow = ndict.doc2bow(match_words)
        match_terms = lda_model[match_bow]
        match_lda_topics = [(describe_topic(key), weight) for (key, weight) in match_terms]
        match_lda_topics.sort(key=lambda x: -x[1])
        new_result = {
            'id': orig_id,
            'title': match_content.extract['title'],
            'url': match_content.url,
            'topics': match_lda_topics,
            'source': match_content.as_json_serializable()
        }
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

    @detail_route(methods=['get'])
    def summary(self, request, pk=None):
        content = get_object_or_404(Content, pk=int(pk))
        count = request.query_params.get('count')
        if count is None:
            count = 5
        else:
            count = int(count)
        return Response(
            {'summary': get_summary_sentences(content, count)},
            status=status.HTTP_200_OK)

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
