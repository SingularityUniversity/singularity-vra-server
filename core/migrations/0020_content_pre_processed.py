# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-07-06 02:43
from __future__ import unicode_literals

import django.contrib.postgres.fields.jsonb
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0019_auto_20160607_0016'),
    ]

    operations = [
        migrations.AddField(
            model_name='content',
            name='pre_processed',
            field=django.contrib.postgres.fields.jsonb.JSONField(default={}),
        ),
    ]
