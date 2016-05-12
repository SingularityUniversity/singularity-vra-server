import json
from django.db import models
from django.core import serializers
from django.contrib.postgres.fields import JSONField
from datetimeutc.fields import DateTimeUTCField
from core.elasticsearch import index_document
from core.s3 import put_content_to_s3
from solo.models import SingletonModel


class Publisher(models.Model):
    '''
    The person or organization that publishes content.  E.g., Scientific American,
    The New Yorker, a blog (or the author of a blog), etc.
    '''
    name = models.CharField(
        max_length=256,
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

    def as_json_serializable(self):
        return json.loads(serializers.serialize('json', [self]))[0]

    def add_to_search_index(self):
        # XXX: should this go here? Will other indexing/extraction methods be called this way?
        index_document(self.as_json_serializable(), self.id)

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
    CHOICES_ERROR = (
        (ERROR_RETRIEVAL, ERROR_RETRIEVAL),
        (ERROR_MISSING_LINK, ERROR_MISSING_LINK),
        (ERROR_EXCEPTION, ERROR_EXCEPTION),
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
