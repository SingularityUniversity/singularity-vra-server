import {showSnackbarMessage} from './snackbar-actions';
import $ from 'jquery';
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
        let defaultWorkspacePromise =  getOrCreateDefaultWorkspace();
        defaultWorkspacePromise.then(
            (workspaceId) => {
                $.ajax({
                    url: '/api/v1/workspace/'+workspaceId,
                    contentType: 'application/json'
                })
                .done((data) => {
                    dispatch(replaceWorkspace(
                        // We don't use the raw representations - we actually wrap them in a thin
                        // layer that can contain metadata about search results, etc
                        data.articles.map((raw_article) =>
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
                .fail(() => {
                    dispatch(showSnackbarMessage("Failed loading workspace"));
                });
            },
            (explanation) => {
                dispatch(showSnackbarMessage("Failed loading workspace: "+explanation));
            }
        )
    }
}

function getOrCreateDefaultWorkspace() {
    // Get a workspace

    let resultPromise = new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/v1/workspace'
        })
        .done((data) => {
            if (data.count > 0) {
                resolve(data.results[0].id);
            } else {
                let data = {
                    title: "Default workspace"
                }
                $.ajax({
                    url: '/api/v1/workspace',
                    method: 'POST',
                    data: JSON.stringify(data),
                    contentType: 'application/json'
                })
                .done((data) => {
                    resolve(data.id);
                })
                .fail(() => {
                    reject("Failed to get default workspace");
                })
            }
        })
        .fail(() => {
            reject("Failed to get list of workspaces");
        });
    });
    return resultPromise;
}
export function saveWorkspace(content_list) {
    return function(dispatch) {
        dispatch(showSnackbarMessage("Saving workspace"));
        const title = "Saved Workspace";
        let defaultWorkspacePromise =  getOrCreateDefaultWorkspace();
        defaultWorkspacePromise.then(
            (workspaceId) => {
                let update_data = {
                    ids: content_list.map((content) => content.pk),
                    title: title
                }
                $.ajax({
                    url: '/api/v1/workspace/'+workspaceId,
                    contentType: 'application/json',
                    method: 'PATCH',
                    data: JSON.stringify(update_data)
                })
                .done(() => {
                    dispatch(showSnackbarMessage("Saved workspace"));
                })
                .fail(() => {
                    dispatch(showSnackbarMessage("Failed saving workspace"));
                })
            },
            (explanation) => {
                dispatch(showSnackbarMessage("Failed saving workspace: "+explanation));
            }
        );
    }
}
