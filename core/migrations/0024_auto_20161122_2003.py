# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-11-22 20:03
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0023_remove_workspace_articles'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='workspace',
            name='articles_new',
        ),
        migrations.AddField(
            model_name='workspace',
            name='articles',
            field=models.ManyToManyField(blank=True, through='core.WorkspaceArticle', to='core.Content'),
        ),
    ]
