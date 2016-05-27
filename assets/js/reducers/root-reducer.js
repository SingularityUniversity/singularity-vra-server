import { combineReducers } from 'redux';
import { clipboardVisibilityReducer, clipboardReducer } from './clipboard-reducer'
import { searchReducer} from './search-reducer'
import { selectedReducer } from './selected-reducer.js'
import { articleCountReducer } from './article-count-reducer.js'

const rootReducer = combineReducers({
  clipboardVisibility: clipboardVisibilityReducer,
  articleSnippetList: clipboardReducer,
  searchData: searchReducer,
  selectedData: selectedReducer,
  articleCount: articleCountReducer
});

export default rootReducer
