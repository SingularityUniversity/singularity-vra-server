from django.conf.urls import url, include
from django.contrib import admin
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    url(r'^', include('core.urls')),
    url(r'^admin', admin.site.urls),
    url(r'^api-docs', include('rest_framework_docs.urls')),
    url(r'^obtain-auth-token', obtain_auth_token),
    url(r'^', include('web.urls')),
]
