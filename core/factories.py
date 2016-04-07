from core.models import *
from django.contrib.auth import get_user_model
from factory import DjangoModelFactory, Sequence, SubFactory, RelatedFactory, \
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


class SequencePublisherFactory(DjangoModelFactory):
    class Meta:
        model = Publisher

    name = Sequence(lambda n: 'Publisher {}'.format(n))
