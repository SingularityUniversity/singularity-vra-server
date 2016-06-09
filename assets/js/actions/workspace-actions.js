import {showSnackbarMessage} from './snackbar-actions';
import {checkResponse, checkResponseAndExtractJSON} from './util';
export const CLEAR_WORKSPACE = 'CLEAR_WORKSPACE'
export const SET_IN_WORKSPACE = 'SET_IN_WORKSPACE'
export const REPLACE_WORKSPACE = 'REPLACE_WORKSPACE'

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

function replaceWorkspace(contentList) {
    return {
        type: REPLACE_WORKSPACE,
        contentList: contentList
    }
}

export function loadWorkspace() {
    return function(dispatch) {
        dispatch(showSnackbarMessage("Loading workspace"));
        getOrCreateDefaultWorkspace()
            .then( workspaceId => {
                return fetch('/api/v1/workspace/'+workspaceId, {
                    credentials: 'include',
                    headers: {'Accept': 'application/json'}
                })
            })
            .then(checkResponseAndExtractJSON)
            .then(json => {
                dispatch(replaceWorkspace(
                    // We don't use the raw representations - we actually wrap them in a thin
                    // layer that can contain metadata about search results, etc
                    json.articles.map((raw_article) =>
                        {
                        return {
                            fields: raw_article,
                            pk: raw_article.id,
                            model: "core.content",
                            score: 1
                        }
                    }
                    )
                ));
                dispatch(showSnackbarMessage("Loaded workspace"));
            })
            .catch(
                (explanation) => {
                    dispatch(showSnackbarMessage("Failed loading workspace: "+explanation));
                }
            );
    }
}

function getOrCreateDefaultWorkspace() {
    // Get a workspace
    // Returns a promise that resolves with the id of current workspace

    return fetch('/api/v1/workspace', {
        credentials: 'include',
        headers: {'Accept': 'application/json'}
    })
    .then(checkResponseAndExtractJSON)
    .then(json =>  {
        if (json.count > 0) {
            let resultPromise = new Promise(resolve => {
                resolve(json.results[0].id);
            });
            return resultPromise;
        } else {
            let data = {
                title: "Default workspace"
            }

            return fetch('/api/v1/workspace', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(checkResponseAndExtractJSON)
            .then(json => {
                return json.id;
            })
            .catch(() => {
                let error = new Error("Failed to create default workspace")
                throw error;
            });

        }
    })
    .catch((explanation) =>  {
        if (!explanation) {
            explanation = "Failed to get list of workspaces";
        }
        let error = new Error(explanation);
        throw error;
    });
}


export function saveWorkspace(content_list) {
    return function(dispatch) {
        dispatch(showSnackbarMessage("Saving workspace"));
        const title = "Saved Workspace";
        getOrCreateDefaultWorkspace()
        .then(
            (workspaceId) => {
                let updateData = {
                    ids: content_list.map((content) => content.pk),
                    title: title
                }
                return fetch('/api/v1/workspace/'+workspaceId, {
                    credentials: 'include',
                    method: 'PATCH',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                })
                .then(checkResponse)
                .then(() =>
                    dispatch(showSnackbarMessage("Saved workspace"))
                )
            })
        .catch(explanation => {
            if (explanation) {
                dispatch(showSnackbarMessage("Failed saving workspace: "+explanation));
            } else {
                dispatch(showSnackbarMessage("Failed saving workspace"));
            }
        })
    }
}
