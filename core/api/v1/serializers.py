import json
import logging
import string
import re
from core.models import Publisher, EnteredSource, Content, PublisherURL, \
    Workspace, WorkspaceArticle
from rest_framework import serializers
from django.forms.models import model_to_dict
from rest_framework.fields import CurrentUserDefault
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User

logger = logging.getLogger(__name__)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ('password', 'username', 'email')
        extra_kwargs = {'password': {'write_only': True}}

    def validate_username(self, value):
        # can't already exist and must be at least 4 characters
        if len(value) < 4:
            raise serializers.ValidationError('Username must be at least 4 characters')
        # XXX: this doesn't deal with possible race conditions
        if get_user_model().objects.filter(username=value):
            raise serializers.ValidationError('Username already in use')
        return value

    def validate_password(self, value):
        # minimum of 8 characters, one upper, one lower, one number, and one
        # punctuation
        error = False
        if len(value) < 8:
            error = True
        elif not any(c in value for c in string.ascii_uppercase):
            error = True
        elif not any(c in value for c in string.ascii_lowercase):
            error = True
        elif not any(c in value for c in string.digits):
            error = True
        elif not any(c in value for c in string.punctuation):
            error = True
        if error:
            raise serializers.ValidationError('Password must have at least 8 characters and at least 1 upper case letter, lower case letter, digit, and punctuation character')
        return value

    def validate_email(self, value):
        # XXX: should we test for email uniqueness?
        if re.match(r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)",
                    value) == None:
            raise serializers.ValidationError('Email must be valid')
        return value

    def create(self, validated_data):
        user = get_user_model().objects.create(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


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
        read_only_fields = ('created', 'extract', 'summary', 'publisher')

class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    '''
    A ModelSerializer that takes an additional `fields` argument that
    controls which fields should be displayed.

    from: https://gist.github.com/manjitkumar/e6580296d634b0a48487
    '''

    def __init__(self, *args, **kwargs):
        super(DynamicFieldsModelSerializer, self).__init__(*args, **kwargs)

        fields = self.context['request'].query_params.get('fields')
        if fields:
            fields = fields.split(',')
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields.keys())
            not_to_display = existing - allowed

            if not_to_display != existing:
                for field_name in not_to_display:
                    self.fields.pop(field_name)


class WorkspaceArticleSerializer(serializers.ModelSerializer):
    article = ContentSerializer()

    class Meta:
        model = WorkspaceArticle
        fields = '__all__'


class WorkspaceSerializer(DynamicFieldsModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True,
                                              default=serializers.CurrentUserDefault())
    articles = WorkspaceArticleSerializer(source='workspacearticle_set', many=True,
                                          read_only=True)

    class Meta:
        model = Workspace
        fields = '__all__'
        read_only_fields = ('created', 'user', 'articles')
