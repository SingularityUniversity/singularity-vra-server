import json
from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from core.factories import *
from core.models import Publisher


class PublisherTests(APITestCase):
    def setUp(self):
        self.user = AdminUserFactory.create()
        pass

    def test_create_publisher(self):
        url = reverse('publisher-list')
        data = {'name': 'Test Publisher'}
        self.client.force_authenticate(user=self.user)
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Publisher.objects.all().count(), 1)
        self.assertEqual(Publisher.objects.all().first().name, data['name'])

    def test_list_publishers(self):
        # create some publishers
        for i in range(5):
            SequencePublisherFactory.create()
        self.assertEqual(Publisher.objects.all().count(), 5)
        url = reverse('publisher-list')
        self.client.force_authenticate(user=self.user)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()['results']), 5)

    def test_get_specific_publisher(self):
        # create some publishers
        publishers = []
        for i in range(5):
            publishers.append(SequencePublisherFactory.create())
        self.assertEqual(Publisher.objects.all().count(), 5)
        url = reverse('publisher-detail', kwargs={'pk': publishers[0].id})
        self.client.force_authenticate(user=self.user)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['id'], publishers[0].id)


