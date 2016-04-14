import io
from django.core.management import call_command
from rest_framework.test import APITestCase
from django.forms.models import model_to_dict
from core.factories import EnteredSourceRSSFactory
from core.models import EnteredSource


class ManageAddRSSTests(APITestCase):
    def test_add_new_rss_entered_source(self):
        with io.StringIO() as outsp:
            with io.StringIO() as errsp:
                call_command('add_rss', 'http://example.com', stdout=outsp, stderr=errsp)
                outsp.seek(0)
                errsp.seek(0)
                out =  eval(outsp.readlines()[0][7:36])
                self.assertEqual(out['exists'], [])
                self.assertEqual(out['success'], [])
                self.assertEqual(errsp.readlines(), [])
        self.assertEqual(EnteredSource.objects.count(), 1)
        rss = EnteredSource.objects.filter().first()
        self.assertEqual(rss.url, 'http://example.com')
        self.assertEqual(rss.source_type, EnteredSource.TYPE_RSS)

    def test_add_new_rss_entered_source_existing_rss(self):
        rss = EnteredSourceRSSFactory.create()
        with io.StringIO() as outsp:
            with io.StringIO() as errsp:
                call_command('add_rss', 'http://example.com', stdout=outsp, stderr=errsp)
                outsp.seek(0)
                errsp.seek(0)
                out = outsp.readlines()
                out1 = out[0]
                out2 =  eval(out[1][7:36])
                self.assertEqual(out1, '\x1b[32;1mArchiving URL with EnteredSource id: 2\x1b[0m\n')
                self.assertEqual(out2['exists'], [])
                self.assertEqual(out2['success'], [])
                self.assertEqual(errsp.readlines(), [])
        self.assertEqual(EnteredSource.objects.count(), 2)
        self.assertEqual(EnteredSource.objects.get(pk=rss.id).source_type, EnteredSource.TYPE_ARCHIVED_RSS)
