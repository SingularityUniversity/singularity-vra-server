# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-06-04 17:25
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0017_auto_20160604_1659'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workspace',
            name='description',
            field=models.CharField(blank=True, max_length=2048, null=True),
        ),
    ]
