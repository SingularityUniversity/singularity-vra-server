# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2016-12-13 21:15
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0026_auto_20161129_1741'),
    ]

    operations = [
        migrations.AddField(
            model_name='workspacearticle',
            name='favorite',
            field=models.BooleanField(default=False),
        ),
    ]