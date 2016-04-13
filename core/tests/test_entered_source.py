from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from core.factories import *
from core.models import *


class EnteredSourceTests(APITestCase):
    def setUp(self):
        # when we need to authenticate to access the API
        #self.user = AdminUserFactory.create()
        pass

    def test_create_entered_source(self):
        url = reverse('enteredsource-list')
        data = {'url': 'http://example.com', 'source_type': EnteredSource.TYPE_PAGE}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(EnteredSource.objects.all().count(), 1)
        self.assertEqual(EnteredSource.objects.all().first().url, data['url'])
        self.assertEqual(EnteredSource.objects.all().first().source_type, data['source_type'])

    def test_list_entered_sources(self):
        # create some entered_sources
        for i in range(5):
            SequenceEnteredSourceFactory.create()
        self.assertEqual(EnteredSource.objects.all().count(), 5)
        url = reverse('enteredsource-list')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 5)

    def test_get_specific_entered_source(self):
        # create some entered_sources
        entered_sources = []
        for i in range(5):
            entered_sources.append(SequenceEnteredSourceFactory.create())
        self.assertEqual(EnteredSource.objects.all().count(), 5)
        url = reverse('enteredsource-detail', kwargs={'pk': entered_sources[0].id})
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['id'], entered_sources[0].id)

    def test_create_second_rss_entered_source_fail(self):
        EnteredSourceRSSFactory.create()
        self.assertEqual(EnteredSource.objects.filter().first().source_type, EnteredSource.TYPE_RSS)
        url = reverse('enteredsource-list')
        data = {'url': 'http://example.com', 'source_type': EnteredSource.TYPE_RSS}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json()['source_type'][0], 'Only one RSS record allowed' )

    def test_update_rss_entered_source_self(self):
        feed = EnteredSourceRSSFactory.create()
        self.assertEqual(EnteredSource.objects.count(), 1)
        url = reverse('enteredsource-detail', kwargs={'pk': feed.id})
        data = {'source_type': EnteredSource.TYPE_RSS}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['id'], feed.id)

    def test_update_rss_entered_source_other_fail(self):
        feed1 = EnteredSourceRSSFactory.create()
        feed2 = SequenceEnteredSourceFactory.create()
        self.assertEqual(EnteredSource.objects.count(), 2)
        url = reverse('enteredsource-detail', kwargs={'pk': feed2.id})
        data = {'source_type': EnteredSource.TYPE_RSS}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json()['source_type'][0], 'Only one RSS record allowed' )
