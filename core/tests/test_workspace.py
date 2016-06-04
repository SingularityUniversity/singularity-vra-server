import json
from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from core.factories import *
from core.models import *
from django.forms.models import model_to_dict


class WorkspaceTests(APITestCase):
    def setUp(self):
        self.admin_user = AdminUserFactory.create()
        self.user1 = SequenceUserFactory.create()
        self.user2 = SequenceUserFactory.create()

    def test_create_workspace(self):
        url = reverse('workspace-list')
        data = {'title': 'Test Workspace', 'description': 'Test workspace description.'}
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Workspace.objects.all().count(), 1)
        self.assertEqual(Workspace.objects.all().first().title, data['title'])
        self.assertEqual(Workspace.objects.all().first().description, data['description'])
        self.assertEqual(Workspace.objects.all().first().user.id, self.user1.id)

    def test_list_workspaces(self):
        # create some workspaces for 2 users
        workspace_ids = []
        for i in range(5):
            workspace = SequenceWorkspaceFactory.create(user=self.user1)
            workspace_ids.append(workspace.id)
            SequenceWorkspaceFactory.create(user=self.user2)
        self.assertEqual(Workspace.objects.all().count(), 10)
        url = reverse('workspace-list')
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()['results']), 5)
        retrieved_ids = [workspace['id'] for workspace in response.json()['results']]
        for workspace_id in workspace_ids:
            self.assertEqual(workspace_id in retrieved_ids, True)

    def test_get_workspace(self):
        # create some workspaces
        workspace_ids = []
        for i in range(5):
            workspace = SequenceWorkspaceFactory.create(user=self.user1)
            workspace_ids.append(workspace.id)
            SequenceWorkspaceFactory.create(user=self.user2)
        self.assertEqual(Workspace.objects.all().count(), 10)
        url = reverse('workspace-detail', kwargs={'pk': workspace_ids[0]})
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['id'], workspace_ids[0])

    def test_get_workspace_other_user_fail(self):
        # create some workspaces
        workspace1 = SequenceWorkspaceFactory.create(user=self.user1)
        workspace2 = SequenceWorkspaceFactory.create(user=self.user2)
        self.assertEqual(Workspace.objects.all().count(), 2)
        url = reverse('workspace-detail', kwargs={'pk': workspace2.id})
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json()['detail'], 'Not found.')

    def test_update_workspace(self):
        workspace1 = SequenceWorkspaceFactory.create(user=self.user1)
        self.assertEqual(Workspace.objects.all().count(), 1)
        url = reverse('workspace-detail', kwargs={'pk': workspace1.id})
        self.client.force_authenticate(user=self.user1)
        data = {'title': 'New Title'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['title'], data['title'])

    def test_update_workspace_user_field_not_updated(self):
        # instead of returning an error, DRF just seems to ignore the request
        # to update a read-only field
        workspace1 = SequenceWorkspaceFactory.create(user=self.user1)
        self.assertEqual(Workspace.objects.all().count(), 1)
        url = reverse('workspace-detail', kwargs={'pk': workspace1.id})
        self.client.force_authenticate(user=self.user1)
        data = {'user': self.user2.id}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['user'], self.user1.id)

    def test_update_workspace_other_other_fail(self):
        workspace2 = SequenceWorkspaceFactory.create(user=self.user2)
        self.assertEqual(Workspace.objects.all().count(), 1)
        url = reverse('workspace-detail', kwargs={'pk': workspace2.id})
        self.client.force_authenticate(user=self.user1)
        data = {'title': 'New Title'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json()['detail'], 'Not found.')
