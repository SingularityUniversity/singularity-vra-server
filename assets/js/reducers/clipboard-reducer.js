import {CLOSE_CLIPBOARD, OPEN_CLIPBOARD, 
    TOGGLE_CLIPBOARD, ADD_SNIPPET_TO_CLIPBOARD,
    REMOVE_SNIPPET_FROM_CLIPBOARD,
    CLEAR_CLIPBOARD} from '../actions/clipboard-actions';

export function clipboardVisibilityReducer(state=false, action) {
    switch(action.type) {
        case CLOSE_CLIPBOARD:
            return false;
        case OPEN_CLIPBOARD:
            return true;
        case TOGGLE_CLIPBOARD:
            return !state;
        default:
            return state;
    }
}

export function clipboardReducer(state=[], action) {
    let snippets;
    let article_index;
    switch(action.type) {
        case ADD_SNIPPET_TO_CLIPBOARD:
            if (state.filter((value) => { return value.content.pk == action.content.pk; }).length > 0) {
                // append the snippet to the existing snippet list in the existing article
                return state.map((clipboard_item) => {
                    if (clipboard_item.content.pk == action.content.pk) {
                        snippets = clipboard_item.snippets.slice();
                        snippets.push(action.snippet);
                        return {
                            content: action.content, 
                            snippets: snippets
                        };
                    } else {
                        return clipboard_item;
                    }
                });
            } else {
                // just append a new article object
                return [
                    ...state,
                    {
                        content: action.content,
                        snippets: [action.snippet]
                    }
                ];
            }
        case REMOVE_SNIPPET_FROM_CLIPBOARD:
            article_index = state.findIndex(x => x.content.pk == action.content.pk);
            if (article_index >= 0) {
                let state_copy = state.slice();
                state_copy[article_index].snippets = state_copy[article_index].snippets.slice();
                state_copy[article_index].snippets.splice(action.snippet_index,1);
                if (state_copy[article_index].snippets.length == 0){
                    state_copy.splice(article_index, 1);
                }
                return state_copy;
            } else {
                return state;
            }
        case CLEAR_CLIPBOARD:
            return [];
        default:
            return state;
    }
}


