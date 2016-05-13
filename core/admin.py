from django.contrib import admin
from core.models import LDAConfiguration, Publisher, PublisherURL, EnteredSource, Content, Issue
from solo.admin import SingletonModelAdmin


class PublisherAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')


class PublisherURLAdmin(admin.ModelAdmin):
    list_display = ('id', 'publisher', 'url')


class EnteredSourceAdmin(admin.ModelAdmin):
    list_display = ('id', 'url', 'created', 'last_polled', 'source_type')


class ContentAdmin(admin.ModelAdmin):
    list_display = ('id', 'publisher', 'guid', 'entered_source', 'created', 'url', 'extract',
                    'summary')

class IssueAdmin(admin.ModelAdmin):
    list_display = ('id', 'source', 'timestamp', 'error_code', 'object_type', 'object_id',
                    'summary', 'other')

admin.site.register(LDAConfiguration, SingletonModelAdmin)
admin.site.register(Publisher, PublisherAdmin)
admin.site.register(PublisherURL, PublisherURLAdmin)
admin.site.register(EnteredSource, EnteredSourceAdmin)
admin.site.register(Content, ContentAdmin)
admin.site.register(Issue, IssueAdmin)
