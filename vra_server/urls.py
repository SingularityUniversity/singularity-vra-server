from django.conf.urls import url, include
from django.contrib import admin

urlpatterns = [
    url(r'^', include('core.urls')),
    url(r'^admin', admin.site.urls),
    url(r'^api-docs', include('rest_framework_docs.urls')),
    url(r'^', include('web.urls')),
]
