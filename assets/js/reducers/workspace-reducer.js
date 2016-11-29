import Moment from 'moment'
import $ from 'jquery'
import {REPLACE_WORKSPACE, CLEAR_WORKSPACE, SET_IN_WORKSPACE} from '../actions/workspace-actions'

export const initialState = {
    id: null,
    title: '',
    description: '',
    articles: [],
    dirty: false
}

export function workspaceReducer(state=initialState, action) {
    let content, inWorkspace, alreadyInWorkspace;
    switch (action.type) {
    case CLEAR_WORKSPACE:
        // XXX: Do we want to clear out the workspace title, id, and description too?
        return Object.assign({}, initialState);
    case SET_IN_WORKSPACE:

        content = action.content;
        inWorkspace = action.inWorkspace;
        if (!inWorkspace) {
                // Turn off membership in workspace - filter out if it somehow exists in the workspace
            let filteredInWorkspace = state.articles.filter(function(workspaceContent) {
                return (content.pk != workspaceContent.pk)
            });
            if (filteredInWorkspace.length != state.articles.length) {
                return Object.assign({}, state, {dirty: true, articles: filteredInWorkspace});
            } else {
                return state;
            }
        }
            // inWorkspace is true
        alreadyInWorkspace = false;
        state.articles.forEach(function(workspaceContent) {
            if (workspaceContent.pk == content.pk) {
                alreadyInWorkspace = true;
            }
        });

        if (!alreadyInWorkspace) {
            let newInWorkspace = state.articles.slice();
            let article = $.extend({}, content);
            let article_content = {
                article: article.fields,
                date_added: Moment()
            };
            article.fields = article_content;
            newInWorkspace.push(article);
            return Object.assign({}, state, {dirty: true, articles: newInWorkspace});
        } else {
            return state;
        }
    case REPLACE_WORKSPACE:
        return Object.assign({}, {dirty: false}, action.workspace);
    default:
        return state;
    }
}
