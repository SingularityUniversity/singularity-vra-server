import logging
from rest_framework import viewsets
from core.models import *
from core.api.v1.serializers import *


logger = logging.getLogger(__name__)


class PublisherViewSet(viewsets.ModelViewSet):
    queryset = Publisher.objects.all()
    serializer_class = PublisherSerializer


class ContentViewSet(viewsets.ModelViewSet):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer


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
