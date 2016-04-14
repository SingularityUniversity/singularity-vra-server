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
                self.assertEqual(len(out), 2)
                self.assertEqual(out['exists'], [])
                self.assertEqual(out['success'], [])
                self.assertEqual(errsp.readlines(), [])
        self.assertEqual(EnteredSource.objects.count(), 1)
        rss = EnteredSource.objects.all().first()
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
                self.assertEqual(len(out), 2)
                self.assertEqual(out1, '\x1b[32;1mArchiving URL with EnteredSource id: {}\x1b[0m\n'.format(rss.id))
                self.assertEqual(out2['exists'], [])
                self.assertEqual(out2['success'], [])
                self.assertEqual(errsp.readlines(), [])
        self.assertEqual(EnteredSource.objects.count(), 2)
        self.assertEqual(EnteredSource.objects.get(pk=rss.id).source_type, EnteredSource.TYPE_ARCHIVED_RSS)

    def test_add_rss_existing_rss_active_match_url(self):
        rss = EnteredSourceRSSFactory.create()
        with io.StringIO() as outsp:
            with io.StringIO() as errsp:
                call_command('add_rss', rss.url, stdout=outsp, stderr=errsp)
                outsp.seek(0)
                errsp.seek(0)
                out = outsp.readlines()
                self.assertEqual(len(out), 1)
                self.assertEqual(out[0], '\x1b[32;1mEnteredSource with URL {} is currently active\x1b[0m\n'.format(rss.url))
                self.assertEqual(errsp.readlines(), [])
        self.assertEqual(EnteredSource.objects.count(), 1)
        self.assertEqual(EnteredSource.objects.get(pk=rss.id).source_type, EnteredSource.TYPE_RSS)

    def test_add_rss_existing_rss_archived_match_url(self):
        rss = EnteredSourceRSSFactory.create(source_type=EnteredSource.TYPE_ARCHIVED_RSS)
        with io.StringIO() as outsp:
            with io.StringIO() as errsp:
                call_command('add_rss', rss.url, stdout=outsp, stderr=errsp)
                outsp.seek(0)
                errsp.seek(0)
                out = outsp.readlines()
                out2 =  eval(out[1][7:36])
                self.assertEqual(len(out), 2)
                self.assertEqual(out[0], '\x1b[32;1mActivating EnteredSource with id: {}\x1b[0m\n'.format(rss.id))
                self.assertEqual(out2['exists'], [])
                self.assertEqual(out2['success'], [])
                self.assertEqual(errsp.readlines(), [])
        self.assertEqual(EnteredSource.objects.count(), 1)
        self.assertEqual(EnteredSource.objects.get(pk=rss.id).source_type, EnteredSource.TYPE_RSS)

    def test_add_rss_existing_rss_archived_match_url_with_active(self):
        active_rss = EnteredSourceRSSFactory.create(url='http://myrss.example.com')
        rss = EnteredSourceRSSFactory.create(source_type=EnteredSource.TYPE_ARCHIVED_RSS)
        with io.StringIO() as outsp:
            with io.StringIO() as errsp:
                call_command('add_rss', rss.url, stdout=outsp, stderr=errsp)
                outsp.seek(0)
                errsp.seek(0)
                out = outsp.readlines()
                out3 =  eval(out[2][7:36])
                self.assertEqual(len(out), 3)
                self.assertEqual(out[0], '\x1b[32;1mArchiving EnteredSource with id: {}\x1b[0m\n'.format(active_rss.id))
                self.assertEqual(out[1], '\x1b[32;1mActivating EnteredSource with id: {}\x1b[0m\n'.format(rss.id))
                self.assertEqual(out3['exists'], [])
                self.assertEqual(out3['success'], [])
                self.assertEqual(errsp.readlines(), [])
        self.assertEqual(EnteredSource.objects.count(), 2)
        self.assertEqual(EnteredSource.objects.get(pk=rss.id).source_type, EnteredSource.TYPE_RSS)
        self.assertEqual(EnteredSource.objects.get(pk=active_rss.id).source_type, EnteredSource.TYPE_ARCHIVED_RSS)
