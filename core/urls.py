from django.conf.urls import url, include
from core.api.v1 import urls

urlpatterns = [
    url(r'^api/v1/', include(urls)),
]
