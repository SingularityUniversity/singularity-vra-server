from django.test import TestCase
from django.core.urlresolvers import reverse
from core.models import Content, EnteredSource, Publisher
from core.factories import AdminUserFactory, SequenceEnteredSourceFactory, SequencePublisherFactory
from rest_framework.test import APITestCase


class TestProcessorTests(TestCase):
    def setUp(self):
        self.entered_source = SequenceEnteredSourceFactory.create()
        self.publisher = SequencePublisherFactory.create()

    def test_summary_sentences_processor(self):
        much_content = Content.objects.create(
            entered_source = self.entered_source,
            url="http://example.com/much",
            publisher=self.publisher,
            extract={
                'content': "There is a big wheel. It has no size. It is large."  
            }
        )
        self.assertEqual(len(much_content.pre_processed['summary_sentences']), 3)
        self.assertIsNone(much_content.as_indexable_json().get('pre_processed'))
        self.assertIsNone(much_content.as_indexable_json()['fields']['extract'].get('pre_processed'))
        self.assertIsNone(much_content.as_indexable_json().get('summary_sentences'))

    def test_content_length_processor(self):
        non_empty_content = Content.objects.create(
            entered_source = self.entered_source,
            url="http://example.com/empty",
            publisher=self.publisher,
            extract={
                'content': "123"  
            }
        )
        self.assertEqual(non_empty_content.pre_processed['content_length'], 3)
        self.assertEqual(non_empty_content.as_indexable_json()['content_length'], 3)
        self.assertIsNone(non_empty_content.as_indexable_json()['fields']['extract'].get('pre_processed'))
        self.assertIsNone(non_empty_content.as_indexable_json().get('pre_processed'))

    def test_content_length_processor_empty(self):
        empty_content = Content.objects.create(
            entered_source = self.entered_source,
            url="http://example.com/empty",
            publisher=self.publisher,
            extract={
                'content': ''
            }
        )
        self.assertEqual(empty_content.pre_processed['content_length'], 0)
        self.assertEqual(empty_content.as_indexable_json()['content_length'], 0)

        empty_content2 = Content.objects.create(
            entered_source = self.entered_source,
            url="http://example.com/empty2",
            publisher=self.publisher,
            extract={
                'content': None 
            }
        )
        self.assertEqual(empty_content2.pre_processed['content_length'], 0)
        self.assertEqual(empty_content2.as_indexable_json()['content_length'], 0)

    def test_readability_processor(self):
        much_content = Content.objects.create(
            entered_source = self.entered_source,
            url="http://example.com/much",
            publisher=self.publisher,
            extract={
                'content': "There is a big wheel. It has no size. It is large."  
            }
        )
        self.assertCountEqual(much_content.pre_processed['readability'].keys(),
                         ('readability_grades', 'sentence_info', 'word_usage', 'sentence_beginnings'))
        self.assertIsNone(much_content.as_indexable_json().get('readability'))

class TestProcessorAPIResults(APITestCase):
    def setUp(self):
        self.user = AdminUserFactory.create()
        self.entered_source = SequenceEnteredSourceFactory.create()
        self.publisher = SequencePublisherFactory.create()
        self.content = Content.objects.create(
            entered_source = self.entered_source,
            url="http://example.com/much",
            publisher=self.publisher,
            extract={
                'content': "There is a big wheel. It has no size. It is large."  
            }
        )

    def test_api_returns_summaries(self):
        url = reverse('content-detail', kwargs={'pk': self.content.id})
        self.client.force_authenticate(user=self.user)
        response = self.client.get(url, format='json')

        summaries = response.json()['pre_processed']['summary_sentences']
        self.assertEqual(len(summaries), 3)
        
    def test_api_returns_content_length(self):
        url = reverse('content-detail', kwargs={'pk': self.content.id})
        self.client.force_authenticate(user=self.user)
        response = self.client.get(url, format='json')

        content_length = response.json()['pre_processed']['content_length']
        self.assertEqual(content_length, len(self.content.extract['content']))
        
    def test_api_returns_readability(self):
        url = reverse('content-detail', kwargs={'pk': self.content.id})
        self.client.force_authenticate(user=self.user)
        response = self.client.get(url, format='json')

        readability = response.json()['pre_processed']['readability']
        self.assertCountEqual(readability.keys(),
                              ('readability_grades', 'sentence_info', 'word_usage', 'sentence_beginnings'))
