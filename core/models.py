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


class PubisherURL(models.Model):
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
    CHOICES_TYPE = (
        (TYPE_RSS, TYPE_RSS),
        (TYPE_PAGE, TYPE_PAGE),
    )
    publisher = models.ForeignKey(
        Publisher,
        on_delete=models.CASCADE
    )
    created = DateTimeUTCField(
        auto_now_add=True
    )
    updated = models.DateTimeField(
        null=True
    )
    url = models.URLField(
        max_length=2048
    )
    source_type = models.PositiveIntegerField(
        choices=CHOICES_TYPE
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
    extract = JSONField()
    summary = models.TextField(
        null=True,
        default=None

    )
