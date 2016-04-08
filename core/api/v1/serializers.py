from rest_framework import serializers
from core.models import *


class PublisherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publisher
        fields = '__all__'


class ContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Content
        fields = '__all__'


class PublisherURLSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublisherURL
        fields = '__all__'


class EnteredSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnteredSource
        fields = '__all__'


class ContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Content
        fields = '__all__'
