import web.views as views
from django.conf.urls import patterns, url, include


app_name = 'web'
urlpatterns = [
    url(r'^', views.index, name='index'),
]
