import { combineReducers } from 'redux';
import { clipboardVisibilityReducer, clipboardReducer } from './clipboard-reducer'
import { searchReducer} from './search-reducer'

const rootReducer = combineReducers({
  clipboardVisibility: clipboardVisibilityReducer,
  articleSnippetList: clipboardReducer,
  searchData: searchReducer 
});

export default rootReducer
