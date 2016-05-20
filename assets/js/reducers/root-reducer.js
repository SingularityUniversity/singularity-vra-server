import { combineReducers } from 'redux';
import { testReducer } from './test-reducer';
import { clipboardVisibilityReducer, clipboardReducer } from './clipboard-reducer'

const rootReducer = combineReducers({
  test: testReducer,
  clipboardVisibility: clipboardVisibilityReducer,
  clipboard: clipboardReducer,
});

export default rootReducer
