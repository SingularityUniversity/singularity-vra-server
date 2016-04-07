from django.conf.urls import patterns, url, include
from core.api.v1 import views
from rest_framework import routers


router = routers.SimpleRouter(trailing_slash=False)
router.register(r'publisher', views.PublisherViewSet)
router.register(r'content', views.ContentViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
]
