from core.models import *
from django.contrib.auth import get_user_model
from factory import DjangoModelFactory, Sequence, SubFactory, \
    PostGenerationMethodCall


class UserFactory(DjangoModelFactory):
    class Meta:
        model = get_user_model()


class AdminUserFactory(UserFactory):
    username = 'test-admin-user'
    password = PostGenerationMethodCall('set_password', 'test-admin-user-password')
    email = 'test-admin-user@example.com'
    is_superuser = True
    is_staff = True
    is_active = True


class SequenceUserFactory(UserFactory):
    username = Sequence(lambda n: 'user{}'.format(n))
    password = PostGenerationMethodCall('set_password', 'abc123')
    email = Sequence(lambda n: 'user{}@example.com'.format(n))


class SequencePublisherFactory(DjangoModelFactory):
    class Meta:
        model = Publisher

    name = Sequence(lambda n: 'Publisher {}'.format(n))


class EnteredSourceRSSFactory(DjangoModelFactory):
    class Meta:
        model = EnteredSource

    url = 'http://rss.example.com'
    source_type = EnteredSource.TYPE_RSS


class SequenceEnteredSourceFactory(DjangoModelFactory):
    class Meta:
        model = EnteredSource

    url = Sequence(lambda n: 'http://example.com/article/{}'.format(n))
    source_type = EnteredSource.TYPE_PAGE

class SequenceWorkspaceFactory(DjangoModelFactory):
    class Meta:
        model = Workspace

    user = SubFactory(SequenceUserFactory)

