from django.contrib import admin
from core.models import *


class PublisherAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')


class PublisherURLAdmin(admin.ModelAdmin):
    list_display = ('id', 'publisher', 'url')


class EnteredSourceAdmin(admin.ModelAdmin):
    list_display = ('id', 'publisher', 'url', 'created', 'last_polled', 'source_type')


class ContentAdmin(admin.ModelAdmin):
    list_display = ('id', 'entered_source', 'created', 'url', 'extract', 'summary')


admin.site.register(Publisher, PublisherAdmin)
admin.site.register(PublisherURL, PublisherURLAdmin)
admin.site.register(EnteredSource, EnteredSourceAdmin)
admin.site.register(Content, ContentAdmin)
