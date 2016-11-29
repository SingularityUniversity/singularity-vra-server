import json
import arrow
from django.db import models
from django.core import serializers
from django.contrib.postgres.fields import JSONField
from django.conf import settings
from datetimeutc.fields import DateTimeUTCField
from core.elasticsearch import index_document
from core.s3 import put_content_to_s3
from solo.models import SingletonModel
from django.utils.module_loading import import_string
from threading import Lock

# We evaulate the preprocessor funcs lazily because it causes circular imports otherwise
_preprocessor_funcs = None
_lock = Lock()

def get_preprocessor_funcs():
    global _preprocessor_funcs
    with _lock:
        if _preprocessor_funcs is None:
            _preprocessor_funcs = {proc_entry[0]: import_string(proc_entry[0]) for proc_entry in settings.CONTENT_PREPROCESSORS}
    return _preprocessor_funcs

class Publisher(models.Model):
    '''
    The person or organization that publishes content.  E.g., Scientific American,
    The New Yorker, a blog (or the author of a blog), etc.
    '''
    name = models.CharField(
        max_length=256,
    )
    statistics = JSONField(
        default={}
    )


class PublisherURL(models.Model):
    '''
    URLs for the home pages of publishers.  E.g., http://www.scientificamerican.com.
    Publishers may have any number of PublisherURLs
    '''
    publisher = models.ForeignKey(
        Publisher,
        on_delete=models.CASCADE
    )
    url = models.URLField(
        max_length=2048
    )


class EnteredSource(models.Model):
    '''
    The URLs for sources (both RSS and individual web pages) entered by users
    of the system.  These are the URLs that content is retrieved from.
    '''
    TYPE_RSS = 1
    TYPE_PAGE = 2
    TYPE_ARCHIVED_RSS = 3
    TYPE_IMPORTED_PAGE = 4
    CHOICES_TYPE = (
        (TYPE_RSS, TYPE_RSS),
        (TYPE_PAGE, TYPE_PAGE),
        (TYPE_ARCHIVED_RSS, TYPE_ARCHIVED_RSS),
        (TYPE_IMPORTED_PAGE, TYPE_IMPORTED_PAGE)
    )
    created = DateTimeUTCField(
        auto_now_add=True
    )
    last_polled = DateTimeUTCField(
        null=True
    )
    url = models.URLField(
        max_length=2048
    )
    source_type = models.PositiveIntegerField(
        choices=CHOICES_TYPE
    )
    last_error = models.CharField(
        max_length=256,
        null=True
    )

def get_content_length(content):
    content_data = content.extract.get('content')
    if content_data is None:
        return 0
    else:
        return len(content_data)

class Content(models.Model):
    entered_source = models.ForeignKey(
        'EnteredSource',
        on_delete=models.CASCADE
    )
    created = DateTimeUTCField(
        auto_now_add=True
    )
    url = models.URLField(
        max_length=2048
    )
    guid = models.CharField(
        max_length=256,
        null=True
    )
    extract = JSONField()
    summary = models.TextField(
        null=True,
        default=None

    )
    publisher = models.ForeignKey(
        Publisher,
        null=True,
        on_delete=models.CASCADE
    )

    pre_processed = JSONField(
        default={}
    )


    def save(self, *args, **kwargs):
        self.pre_processed = self._get_pre_processing_data()
        super().save(*args, **kwargs)

    def _get_pre_processing_data(self):
        '''
        This means that to force the preprocessing, you just call .update or .save
        '''
        pre_processed = {}
        for processor in settings.CONTENT_PREPROCESSORS:
            func = get_preprocessor_funcs()[processor[0]]
            key = processor[1]
            pre_processed[key] = func(self)
        return pre_processed

    def as_json_serializable(self):
        return json.loads(serializers.serialize('json', [self]))[0]

    def as_indexable_json(self):
        body_json = self.as_json_serializable()
        content = body_json['fields']['extract']['content']
        # XXX: include only pre_processed fields that should be indexed
        included_processor_keys = [processor[1] for processor in settings.CONTENT_PREPROCESSORS if
                                   len(processor) > 2 and processor[2]]
        for key in body_json['fields']['pre_processed']:
            if key in included_processor_keys:
                body_json[key] = body_json['fields']['pre_processed'][key]
        return body_json

    def add_to_search_index(self):
        # XXX: should this go here? Will other indexing/extraction methods be called this way?
        index_document(self.as_indexable_json(), self.id)

    def add_to_s3(self):
        put_content_to_s3(self)


class LDAConfiguration(SingletonModel):
    class Meta:
        verbose_name = "LDA Configuration"

    num_topics = models.PositiveIntegerField(
        default=50
    )

    lda_passes = models.SmallIntegerField(
        default=10
    )


class Issue(models.Model):
    '''
    A class for tracking issues in the processing pipeline, such as empty content, bad URLs, etc
    '''
    ERROR_RETRIEVAL = 1
    ERROR_MISSING_LINK = 2
    ERROR_EXCEPTION = 3
    ERROR_NO_CONTENT = 4
    CHOICES_ERROR = (
        (ERROR_RETRIEVAL, ERROR_RETRIEVAL),
        (ERROR_MISSING_LINK, ERROR_MISSING_LINK),
        (ERROR_EXCEPTION, ERROR_EXCEPTION),
        (ERROR_NO_CONTENT, ERROR_NO_CONTENT),
    )

    source = models.CharField(
        null=True,
        max_length=256
    )
    timestamp = DateTimeUTCField(
        auto_now_add=True
    )
    error_code = models.PositiveIntegerField(
        choices = CHOICES_ERROR
    )
    object_type = models.CharField(
        null=True,
        max_length=256
    )
    object_id = models.PositiveIntegerField(
        null=True
    )
    summary = models.CharField(
        null=True,
        max_length=2048
    )
    other = JSONField(
        null=True
    )


class Workspace(models.Model):
    def get_default_title():
        return 'Workspace {}'.format(arrow.utcnow().format('YYYY-MM-DDTHH:mm:ss'))

    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    title = models.CharField(
        max_length=256,
        default=get_default_title
    )
    description = models.CharField(
        max_length=2048,
        null=True,
        blank=True
    )
    created = DateTimeUTCField(
        auto_now_add=True
    )
    edited = DateTimeUTCField(
        auto_now_add=True
    )
    published = models.BooleanField(
        default=False
    )
    articles = models.ManyToManyField(
        Content,
        blank=True,
        through='WorkspaceArticle'
    )

class WorkspaceArticle(models.Model):
    article = models.ForeignKey(Content, on_delete=models.CASCADE)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
    date_added = models.DateTimeField(auto_now_add=True)
