# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2016-11-28 20:47
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0024_auto_20161122_2003'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workspacearticle',
            name='date_added',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
