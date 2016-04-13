from django.db import models
from django.contrib.postgres.fields import JSONField
from datetimeutc.fields import DateTimeUTCField


class Publisher(models.Model):
    '''
    The person or organization that publishes content.  E.g., Scientific American,
    The New Yorker, a blog (or the author of a blog), etc.
    '''
    name = models.CharField(
        max_length=256,
        unique=True
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
    CHOICES_TYPE = (
        (TYPE_RSS, TYPE_RSS),
        (TYPE_PAGE, TYPE_PAGE),
        (TYPE_ARCHIVED_RSS, TYPE_ARCHIVED_RSS)
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
