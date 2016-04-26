from django.conf.urls import url, include
from django.contrib import admin
from rest_framework_jwt.views import obtain_jwt_token

urlpatterns = [
    url(r'^', include('core.urls')),
    url(r'^admin', admin.site.urls),
    url(r'^api-docs', include('rest_framework_docs.urls')),
    url(r'^api-token-auth', obtain_jwt_token),
    url(r'^', include('web.urls')),
]
