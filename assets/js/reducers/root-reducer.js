import { combineReducers } from 'redux';
import { clipboardVisibilityReducer, clipboardReducer } from './clipboard-reducer'

const rootReducer = combineReducers({
  clipboardVisibility: clipboardVisibilityReducer,
  articleSnippetList: clipboardReducer,
});

export default rootReducer
