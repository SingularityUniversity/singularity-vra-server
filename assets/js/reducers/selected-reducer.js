import {CLEAR_WORKSPACE, SET_IN_WORKSPACE} from '../actions/selected-actions'

export const initialState = [];

export function selectedReducer(state=initialState, action) {
    let content, inWorkspace, alreadyInWorkspace;
    switch (action.type) {
    case CLEAR_WORKSPACE:
        return [];
    case SET_IN_WORKSPACE:
        content = action.content;
        inWorkspace = action.inWorkspace;
        if (!inWorkspace) { 
                // Turn off membership in workspace - filter out if it somehow exists in the workspace 
            let filteredInWorkspace = state.filter(function(workspaceContent) {
                return (content.pk != workspaceContent.pk)
            });
            if (filteredInWorkspace.length != state.length) {
                return (filteredInWorkspace);
            } else {
                return state;
            }
        }
            // inWorkspace is true
        alreadyInWorkspace = false;
        state.forEach(function(workspaceContent) {
            if (workspaceContent.pk == content.pk) {
                alreadyInWorkspace = true;
            }
        });

        if (!alreadyInWorkspace) {
            let newInWorkspace = state.slice();
            newInWorkspace.push(content);
            return newInWorkspace;
        } else {
            return state;
        }
    default:
        return state;
    }
}
