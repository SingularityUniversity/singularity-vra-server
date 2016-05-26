import { combineReducers } from 'redux';
import { clipboardVisibilityReducer, clipboardReducer } from './clipboard-reducer'
import { keywordSearchReducer } from './search-reducer'

const rootReducer = combineReducers({
  clipboardVisibility: clipboardVisibilityReducer,
  articleSnippetList: clipboardReducer,
  keywordSearchText: keywordSearchReducer
});

export default rootReducer
