import {showSnackbarMessage} from './snackbar-actions';
import {showSearchResults, similaritySearch} from './search-actions';
import {checkResponseAndExtractJSON, checkResponse} from './util';

import Moment from 'moment';

export const CLEAR_WORKSPACE = 'CLEAR_WORKSPACE'
export const SET_IN_WORKSPACE = 'SET_IN_WORKSPACE'
export const REPLACE_WORKSPACE = 'REPLACE_WORKSPACE'
export const SORT_WORKSPACE = 'SORT_WORKSPACE'

export function clearWorkspace() {
    return {
        type: CLEAR_WORKSPACE
    }
}

export function setInWorkspace(content, inWorkspace) {
    return {
        type: SET_IN_WORKSPACE,
        content: content,
        inWorkspace: inWorkspace
    }
}

function replaceWorkspace(workspace) {
    return {
        type: REPLACE_WORKSPACE,
        workspace: workspace
    }
}

export function loadWorkspace(workspaceId) {
    return (dispatch => {
        dispatch(showSnackbarMessage("Loading workspace"));
        return fetch('/api/v1/workspace/'+workspaceId, {
            credentials: 'include',
            headers: {'Accept': 'application/json'}
        })
        .then(checkResponseAndExtractJSON)
        .then(json => {
            dispatch(replaceWorkspace({
                id: json.id,
                // We don't use the raw representations - we actually wrap them in a thin
                // layer that can contain metadata about search results, etc
                articles: json.articles.map((raw_article) => {
                    return {
                        fields: raw_article,
                        pk: raw_article.article.id,
                        model: "core.content",
                        score: 1
                    }
                }),
                title: json.title,
                description: json.description
            }))
            dispatch(similaritySearch(json.articles.map(raw_article => raw_article.id),
                Moment(json.created).unix()));
            dispatch(showSnackbarMessage("Loaded workspace"));
            dispatch(showSearchResults());
        })
    });
}

export function deleteWorkspace(workspaceId) {
    return (dispatch => {
        return fetch('/api/v1/workspace/'+workspaceId, {
            credentials: 'include',
            headers: {'Accept': 'application/json'},
            method: 'DELETE'
        })
            .then(checkResponse)
            .then(() => {
                dispatch(showSnackbarMessage("Deleted workspace"));
            })
    });
}

// This is not a reducer action, so do not call it with dispatch()
export function getWorkspaces() {
    return fetch('/api/v1/workspace?fields=id,title,description', {
        credentials: 'include',
        headers: {'Accept': 'application/json'}
    }).
    then(checkResponseAndExtractJSON).
    then(json => {
        return json.results;
    });
}

export function updateWorkspace(workspaceData) {
    return function(dispatch) {
        let workspaceId = workspaceData.id;
        let patchWorkspaceData = {
            title: workspaceData.title,
            ids: workspaceData.articles.map(article => {
                return {
                    id: article.pk,
                    date_added: article.fields.date_added
                }
            }),
            description: workspaceData.description
        }
        dispatch(showSnackbarMessage(`Saving workspace ${workspaceData.title}`));

        return fetch(`/api/v1/workspace/${workspaceId}`, {
            credentials: 'include',
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patchWorkspaceData)
        })
        .then(checkResponseAndExtractJSON)
        .then(json => {
            // Update the workspace in the store with the new data
            dispatch(replaceWorkspace(workspaceData));
            dispatch(showSnackbarMessage(`Saved workspace ${workspaceData.title}`));
            return json.id;
        })
    }
}

export function createWorkspace(workspaceData) {
    return function(dispatch) {
        dispatch(showSnackbarMessage(`Saving new workspace ${workspaceData.title}`));
        let postWorkspaceData = {
            title: workspaceData.title,
            ids: workspaceData.articles.map(article => {
                return {
                    id: article.pk,
                    date_added: article.fields.date_added
                }
            }),
            description: workspaceData.description
        }
        return fetch('/api/v1/workspace', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postWorkspaceData)
        })
        .then(checkResponseAndExtractJSON)
        .then(json => {
            // Update the workspace in the store with the id
            let newWorkspace = {...workspaceData, dirty:false,  id:json.id};
            dispatch(replaceWorkspace(newWorkspace));
            dispatch(showSnackbarMessage(`Saved new workspace ${workspaceData.title}`));
            return json.id;
        })
    }
}

export function sortWorkspace(type) {
    return  {
        type: SORT_WORKSPACE,
        sortType: type
    };
}

