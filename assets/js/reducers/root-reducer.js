import { combineReducers } from 'redux';
import { clipboardVisibilityReducer, clipboardReducer } from './clipboard-reducer'
import { searchReducer} from './search-reducer'
import { workspaceReducer} from './workspace-reducer'
import { articleCountReducer } from './article-count-reducer'
import { snackbarReducer} from './snackbar-reducer'

const rootReducer = combineReducers({
    clipboardVisibility: clipboardVisibilityReducer,
    articleSnippetList: clipboardReducer,
    searchData: searchReducer,
    workspaceData: workspaceReducer,
    articleCount: articleCountReducer,
    snackbar: snackbarReducer
});

export default rootReducer
