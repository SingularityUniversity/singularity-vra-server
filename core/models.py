from django.db import models
from django.contrib.postgres.fields import JSONField
from datetimeutc.fields import DateTimeUTCField


class Source(models.Model):
    TYPE_RSS = 1
    TYPE_PAGE = 2
    CHOICES_TYPE = (
        (TYPE_RSS, TYPE_RSS),
        (TYPE_PAGE, TYPE_PAGE),
    )
    created = DateTimeUTCField(
        auto_now_add=True
    )
    url = models.URLField(
        max_length=2048
    )
    source_type = models.PositiveIntegerField(
        choices=CHOICES_TYPE
    )


class Content(models.Model):
    source = models.ForeignKey(
        Source,
        on_delete=models.CASCADE
    )
    created = DateTimeUTCField(
        auto_now_add=True
    )
    extract = JSONField()
    summary = models.TextField(
        null=True,
        default=None

    )
