import json
import arrow
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

    def test_create_workspace_other_user_ignored(self):
        '''
        If the user attribute is passed into the request data, it is ignored
        and the user info from request.user is actually used.
        '''
        url = reverse('workspace-list')
        data = {'title': 'Test Workspace', 'description': 'Test workspace description.',
                'user': self.user2.id}
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

    def test_update_workspace_one_article(self):
        article = SequenceContentFactory.create()
        workspace1 = SequenceWorkspaceFactory.create(user=self.user1)
        self.assertEqual(Workspace.objects.all().count(), 1)
        url = reverse('workspace-detail', kwargs={'pk': workspace1.id})
        self.client.force_authenticate(user=self.user1)
        data = {'title': 'New Title', 'id': {'id': article.id,
                                             'date_added': arrow.now().format(),
                                             'favorite': False}}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['title'], data['title'])
        workspace_obj = Workspace.objects.get(pk=workspace1.id)
        article_list = workspace_obj.articles.all()
        self.assertIn(article.id, [article.id for article in article_list])
        self.assertEqual(1, len(article_list))

    def test_update_workspace_many_articles(self):
        article1 = SequenceContentFactory.create()
        article2 = SequenceContentFactory.create()
        workspace1 = SequenceWorkspaceFactory.create(user=self.user1)
        self.assertEqual(Workspace.objects.all().count(), 1)
        url = reverse('workspace-detail', kwargs={'pk': workspace1.id})
        self.client.force_authenticate(user=self.user1)
        data = {'title': 'New Title',
                'ids': [{'id': article1.id, 'date_added': arrow.now().format(),
                         'favorite': False},
                        {'id': article2.id, 'date_added': arrow.now().format(),
                         'favorite': False}]}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['title'], data['title'])
        workspace_obj = Workspace.objects.get(pk=workspace1.id)
        article_list = workspace_obj.articles.all()
        self.assertIn(article1.id, [article.id for article in article_list])
        self.assertIn(article2.id, [article.id for article in article_list])
        self.assertEqual(2, len(article_list))

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

    def test_add_article(self):
        '''
        Create an article and a workspace then add the article to the
        workspace.
        '''
        article = SequenceContentFactory.create()
        workspace = SequenceWorkspaceFactory.create(user=self.user1)
        url = reverse('workspace-add', kwargs={'pk': workspace.id})
        self.client.force_authenticate(user=self.user1)
        data = {'id': {'id': article.id, 'date_added': arrow.now().format(),
                       'favorite': False}}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertTrue(article.id in
                        [article.id for article in
                         Workspace.objects.get(pk=workspace.id).articles.all()])

    def test_add_duplicate_article(self):
        article = SequenceContentFactory.create()
        workspace = SequenceWorkspaceFactory.create(user=self.user1)
        url = reverse('workspace-add', kwargs={'pk': workspace.id})
        self.client.force_authenticate(user=self.user1)
        data = {'id': {'id': article.id, 'date_added': arrow.now().format(),
                       'favorite': False}}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertTrue(article.id in
                        [article.id for article in
                         Workspace.objects.get(pk=workspace.id).articles.all()])
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Workspace.objects.get(pk=workspace.id).articles.all().count(),
                         1)
        self.assertTrue(article.id in
                        [article.id for article in
                         Workspace.objects.get(pk=workspace.id).articles.all()])

    def test_add_article_non_existant_workspace_fail(self):
        article = SequenceContentFactory.create()
        workspace = SequenceWorkspaceFactory.create(user=self.user1)
        bad_workspace_id = 987654321
        self.assertTrue(bad_workspace_id != workspace.id)
        url = reverse('workspace-add', kwargs={'pk': bad_workspace_id})
        self.client.force_authenticate(user=self.user1)
        data = {'id': {'id': article.id, 'date_added': arrow.now().format(),
                       'favorite': False}}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_add_article_other_user_workspace_fail(self):
        article = SequenceContentFactory.create()
        workspace1= SequenceWorkspaceFactory.create(user=self.user1)
        workspace2= SequenceWorkspaceFactory.create(user=self.user2)
        url = reverse('workspace-add', kwargs={'pk': workspace2.id})
        self.client.force_authenticate(user=self.user1)
        data = {'id': {'id': article.id, 'date_added': arrow.now().format(),
                       'favorite': False}}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Workspace.objects.get(pk=workspace1.id).articles.all().count(),
                         0)
        self.assertEqual(Workspace.objects.get(pk=workspace2.id).articles.all().count(),
                         0)

    def test_add_non_existant_article_fail(self):
        article = SequenceContentFactory.create()
        bad_article_id = 987654321
        self.assertTrue(bad_article_id != article.id)
        workspace = SequenceWorkspaceFactory.create(user=self.user1)
        url = reverse('workspace-add', kwargs={'pk': workspace.id})
        self.client.force_authenticate(user=self.user1)
        data = {'id': {'id': bad_article_id, 'date_added': arrow.now().format(),
                       'favorite': False}}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_add_multiple_articles(self):
        article1 = SequenceContentFactory.create()
        article2 = SequenceContentFactory.create()
        workspace = SequenceWorkspaceFactory.create(user=self.user1)
        url = reverse('workspace-add', kwargs={'pk': workspace.id})
        self.client.force_authenticate(user=self.user1)
        data = {'ids': [{'id': article1.id, 'date_added': arrow.now().format(),
                         'favorite': False},
                        {'id': article2.id, 'date_added': arrow.now().format(),
                         'favorite': False}]}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Workspace.objects.get(pk=workspace.id).articles.all().count(),
                         2)
        self.assertTrue(article1.id in
                        [article.id for article in
                         Workspace.objects.get(pk=workspace.id).articles.all()])
        self.assertTrue(article2.id in
                        [article.id for article in
                         Workspace.objects.get(pk=workspace.id).articles.all()])

    def add_articles_to_workspace(self, workspace, count):
        article_ids = []
        articles = []
        for i in range(count):
            article = SequenceContentFactory.create()
            articles.append(article)
            article_ids.append({'id': article.id, 'date_added': arrow.now().format(),
                                'favorite': False})
        url = reverse('workspace-add', kwargs={'pk': workspace.id})
        self.client.force_authenticate(user=workspace.user)
        data = {'ids': article_ids}
        self.client.post(url, data, format='json')
        return articles

    def test_remove_article(self):
        workspace = SequenceWorkspaceFactory.create(user=self.user1)
        articles = self.add_articles_to_workspace(workspace, 1)
        self.assertTrue(Workspace.objects.get(pk=workspace.id).articles.all().count(),
                        1)
        url = reverse('workspace-remove', kwargs={'pk': workspace.id})
        self.client.force_authenticate(user=self.user1)
        data = {'id': articles[0].id}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Workspace.objects.get(pk=workspace.id).articles.all().count(),
                        0)

    def test_remove_article_not_in_workspace(self):
        workspace = SequenceWorkspaceFactory.create(user=self.user1)
        article = SequenceContentFactory.create()
        articles = self.add_articles_to_workspace(workspace, 1)
        self.assertTrue(Workspace.objects.get(pk=workspace.id).articles.all().count(),
                        1)
        url = reverse('workspace-remove', kwargs={'pk': workspace.id})
        self.client.force_authenticate(user=self.user1)
        data = {'id': article.id}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Workspace.objects.get(pk=workspace.id).articles.all().count(),
                         1)

    def test_remove_article_non_existant_workspace_fail(self):
        article = SequenceContentFactory.create()
        workspace = SequenceWorkspaceFactory.create(user=self.user1)
        bad_workspace_id = 987654321
        self.assertTrue(bad_workspace_id != workspace.id)
        url = reverse('workspace-remove', kwargs={'pk': bad_workspace_id})
        self.client.force_authenticate(user=self.user1)
        data = {'id': {'id': article.id, 'date_added': arrow.now().format(),
                       'favorite': False}}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_remove_article_other_user_workspace(self):
        article = SequenceContentFactory.create()
        workspace1= SequenceWorkspaceFactory.create(user=self.user1)
        articles1 = self.add_articles_to_workspace(workspace1, 1)
        self.assertTrue(Workspace.objects.get(pk=workspace1.id).articles.all().count(),
                        1)
        workspace2= SequenceWorkspaceFactory.create(user=self.user2)
        articles2 = self.add_articles_to_workspace(workspace2, 1)
        self.assertTrue(Workspace.objects.get(pk=workspace2.id).articles.all().count(),
                        1)
        url = reverse('workspace-remove', kwargs={'pk': workspace2.id})
        self.client.force_authenticate(user=self.user1)
        data = {'id': {'id': articles2[0].id, 'date_added': arrow.now().format(),
                       'favorite': False}}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Workspace.objects.get(pk=workspace1.id).articles.all().count(),
                         1)
        self.assertEqual(Workspace.objects.get(pk=workspace2.id).articles.all().count(),
                         1)

    def test_remove_non_existant_article_fail(self):
        workspace = SequenceWorkspaceFactory.create(user=self.user1)
        articles = self.add_articles_to_workspace(workspace, 1)
        bad_article_id = 987654321
        self.assertTrue(bad_article_id not in [article.id for article in articles])
        self.assertTrue(Workspace.objects.get(pk=workspace.id).articles.all().count(),
                        1)
        url = reverse('workspace-remove', kwargs={'pk': workspace.id})
        self.client.force_authenticate(user=self.user1)
        data = {'id': bad_article_id }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(Workspace.objects.get(pk=workspace.id).articles.all().count(),
                        1)

    def test_remove_multiple_articles(self):
        workspace = SequenceWorkspaceFactory.create(user=self.user1)
        articles = self.add_articles_to_workspace(workspace, 3)
        self.assertTrue(Workspace.objects.get(pk=workspace.id).articles.all().count(),
                        3)
        url = reverse('workspace-remove', kwargs={'pk': workspace.id})
        self.client.force_authenticate(user=self.user1)
        data = {'ids': [articles[0].id, articles[1].id]}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Workspace.objects.get(pk=workspace.id).articles.all().count(),
                        1)
        self.assertEqual(Workspace.objects.get(pk=workspace.id).articles.all()[0].id,
                         articles[2].id)

    def test_partial_update_one_article(self):
        workspace = SequenceWorkspaceFactory.create(user=self.user1)
        articles = self.add_articles_to_workspace(workspace, 3)
        new_article = SequenceContentFactory.create()
        url = reverse('workspace-detail', kwargs={'pk': workspace.id})
        self.client.force_authenticate(user=self.user1)
        data={'id': {'id': new_article.id, 'date_added': arrow.now().format(),
                     'favorite': False}}
        response = self.client.patch(url, data, format='json')
        workspace_all_articles = Workspace.objects.get(pk=workspace.id).articles.all()
        self.assertEqual([new_article.id], [x.id for x in workspace_all_articles])

    def test_partial_update_many_articles(self):
        workspace = SequenceWorkspaceFactory.create(user=self.user1)
        articles = self.add_articles_to_workspace(workspace, 3)
        new_article1 = SequenceContentFactory.create()
        new_article2 = SequenceContentFactory.create()
        url = reverse('workspace-detail', kwargs={'pk': workspace.id})
        self.client.force_authenticate(user=self.user1)
        data = {'ids': [{'id': new_article1.id, 'date_added': arrow.now().format(),
                         'favorite': False},
                        {'id': new_article2.id, 'date_added': arrow.now().format(),
                         'favorite': False}]}
        response = self.client.patch(url, data, format='json')
        workspace_all_articles = Workspace.objects.get(pk=workspace.id).articles.all()
        self.assertEqual([new_article1.id, new_article2.id], [x.id for x in workspace_all_articles])

    def test_create_with_one_article(self):
        new_article = SequenceContentFactory.create()
        url = reverse('workspace-list')
        self.client.force_authenticate(user=self.user1)
        data = {'title': 'New Workspace', 'description': 'Description',
                'id': {'id': new_article.id, 'date_added': arrow.now().format(),
                       'favorite': False}}
        response = self.client.post(url, data, format='json')
        workspace_id = response.json()['id']
        workspace_all_articles = Workspace.objects.get(pk=workspace_id).articles.all()
        self.assertEqual([new_article.id], [x.id for x in workspace_all_articles])

    def test_create_with_many_articles(self):
        new_article1 = SequenceContentFactory.create()
        new_article2 = SequenceContentFactory.create()
        url = reverse('workspace-list')
        self.client.force_authenticate(user=self.user1)
        data = {'title': 'New Workspace', 'description': 'Description',
                'ids': [{'id': new_article1.id, 'date_added': arrow.now().format(),
                         'favorite': False},
                        {'id': new_article2.id, 'date_added': arrow.now().format(),
                         'favorite': False}]}
        response = self.client.post(url, data, format='json')
        workspace_id = response.json()['id']
        workspace_all_articles = Workspace.objects.get(pk=workspace_id).articles.all()
        self.assertEqual([new_article1.id, new_article2.id], [x.id for x in workspace_all_articles])
