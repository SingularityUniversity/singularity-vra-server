import logging
from core.models import Publisher, EnteredSource, Content, PublisherURL
from rest_framework import serializers

logger = logging.getLogger(__name__)


class PublisherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publisher
        fields = '__all__'


class PublisherURLSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublisherURL
        fields = '__all__'


class EnteredSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnteredSource
        fields = '__all__'
        read_only_fields = ('created', 'last_polled', 'last_error')

    def validate_source_type(self, value):
        '''
        "There can be only one..."

        Only allow insert or update an EnteredSource of type TYPE_RSS if there
        isn't already one in the database (unless it is this one)
        '''
        if value == EnteredSource.TYPE_RSS:
            if self.context['request'].method in ['PATCH', 'PUT']:
                rss_feeds = EnteredSource.objects.filter(
                    source_type=EnteredSource.TYPE_RSS).exclude(pk=self.instance.id)
            else:
                rss_feeds = EnteredSource.objects.filter(
                    source_type=EnteredSource.TYPE_RSS)
            if rss_feeds.count() > 0:
                raise serializers.ValidationError('Only one RSS record allowed')
        return value


class ContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Content
        fields = '__all__'
        read_only_fields = ('created', 'extract', 'summary')
