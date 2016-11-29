# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-11-22 20:01
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0021_publisher_statistics'),
    ]

    operations = [
        migrations.CreateModel(
            name='WorkspaceArticle',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_added', models.DateField(auto_now_add=True)),
                ('article', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.Content')),
                ('workspace', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.Workspace')),
            ],
        ),
        migrations.AddField(
            model_name='workspace',
            name='articles_new',
            field=models.ManyToManyField(blank=True, related_name='articles_new', through='core.WorkspaceArticle', to='core.Content'),
        ),
    ]