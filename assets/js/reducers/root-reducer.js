import { combineReducers } from 'redux';
import { clipboardVisibilityReducer, clipboardReducer } from './clipboard-reducer'
import { searchReducer} from './search-reducer'
import { selectedReducer } from './selected-reducer.js'

const rootReducer = combineReducers({
  clipboardVisibility: clipboardVisibilityReducer,
  articleSnippetList: clipboardReducer,
  searchData: searchReducer,
  selectedData: selectedReducer
});

export default rootReducer
