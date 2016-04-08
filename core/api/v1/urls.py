from django.conf.urls import patterns, url, include
from core.api.v1 import views
from rest_framework_nested import routers


router = routers.SimpleRouter(trailing_slash=False)
router.register(r'publisher', views.PublisherViewSet)
router.register(r'content', views.ContentViewSet)
router.register(r'entered_source', views.EnteredSourceViewSet)

publisher_router = routers.NestedSimpleRouter(router, r'publisher',
                                              lookup='publisher',
                                              trailing_slash=False)
publisher_router.register(r'url', views.PublisherPublisherURLViewSet,
                          base_name='publisher-url')
publisher_router.register(r'entered_source', views.PublisherEnteredSourceViewSet,
                          base_name='publisher-entered-source')

entered_source_router = routers.NestedSimpleRouter(router, r'entered_source',
                                                   lookup='entered_source',
                                                   trailing_slash=False)
entered_source_router.register(r'content', views.EnteredSourceContentViewSet,
                               base_name='entered-source-content')

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^', include(publisher_router.urls)),
    url(r'^', include(entered_source_router.urls)),
]
