import logging
from rest_framework import viewsets, status
from core.models import *
from core.api.v1.serializers import *
from rest_framework.decorators import detail_route
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from text.common import get_lda_data, tokenize_text_block, extract_words_from_content
import numpy as np

logger = logging.getLogger(__name__)


class PublisherViewSet(viewsets.ModelViewSet):
    queryset = Publisher.objects.all()
    serializer_class = PublisherSerializer


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
        bow = ndict.doc2bow(extract_words_from_content(content))
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
                'topics': match_lda_topics
            }
            results.append(new_result)
        result = {
            'results': results,
            'query_topics': doc_topics
        }

        return Response(result, status=status.HTTP_200_OK)


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
