from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from core.factories import *
from core.models import Source


class SourceTests(APITestCase):
    def setUp(self):
        # when we need to authenticate to access the API
        #self.user = AdminUserFactory.create()
        pass

    def test_create_source(self):
        url = reverse('source-list')
        data = {'url': 'http://www.singularityu.org', 'source_type': Source.TYPE_PAGE}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Source.objects.all().count(), 1)
        self.assertEqual(Source.objects.all().first().url, data['url'])
        self.assertEqual(Source.objects.all().first().source_type, data['source_type'])

    def test_list_sources(self):
        # create some sources
        for i in range(5):
            SequenceSourceFactory.create()
        self.assertEqual(Source.objects.all().count(), 5)
        url = reverse('source-list')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 5)

    def test_get_specific_source(self):
        # create some sources
        sources = []
        for i in range(5):
            sources.append(SequenceSourceFactory.create())
        self.assertEqual(Source.objects.all().count(), 5)
        url = reverse('source-detail', kwargs={'pk': sources[0].id})
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['id'], sources[0].id)


