from django.contrib import admin
from core.models import *

class SourceAdmin(admin.ModelAdmin):
    list_display = ('id', 'url', 'created', 'source_type')


class ContentAdmin(admin.ModelAdmin):
    list_display = ('id', 'source', 'created', 'extract', 'summary')


admin.site.register(Source, SourceAdmin)
admin.site.register(Content, ContentAdmin)
