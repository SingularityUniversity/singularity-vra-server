from django.test import TestCase
from core.models import Content, EnteredSource, Publisher


class TestProcessorTests(TestCase):
    def setUp(self):
        self.entered_source = EnteredSource.objects.create(
            url="http://example.com",
            source_type=EnteredSource.TYPE_PAGE
        )

        self.publisher = Publisher.objects.create(
            name="Test Publisher"
        )

    def test_content_length_processor(self):
        empty_content = Content.objects.create(
            entered_source = self.entered_source,
            url="http://example.com/empty",
            publisher=self.publisher,
            extract={
                'content': "123"  
            }
        )
        self.assertEqual(empty_content.pre_processed['content_length'], 3)
        self.assertEqual(empty_content.as_indexable_json()['content_length'], 3)
        self.assertIsNone(empty_content.as_indexable_json().get('pre_processed'))

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


