import { combineReducers } from 'redux';
import { clipboardVisibilityReducer, clipboardReducer } from './clipboard-reducer'
import { searchReducer, searchResultsVisibilityReducer} from './search-reducer'
import { workspaceReducer} from './workspace-reducer'
import { articleCountReducer } from './article-count-reducer'
import { snackbarReducer} from './snackbar-reducer'

import {LOGOUT} from '../actions/auth-actions'
import { initialState }  from '../configure-store';

const appReducer = combineReducers({
    clipboardVisibility: clipboardVisibilityReducer,
    articleSnippetList: clipboardReducer,
    searchData: searchReducer,
    searchResultsVisibility:  searchResultsVisibilityReducer,
    workspaceData: workspaceReducer,
    articleCount: articleCountReducer,
    snackbar: snackbarReducer
});

const rootReducer = (state, action) => {
    if (action.type == LOGOUT) {
        state = initialState;
    }
    return appReducer(state, action);
}

export default rootReducer
