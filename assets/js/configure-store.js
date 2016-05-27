import { createStore, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import rootReducer from './reducers/root-reducer';
import {initialState as searchInitialState} from './reducers/search-reducer';
import {initialState as selectedInitialState} from './reducers/selected-reducer';

export const initialState = {
  clipboardVisibility: false,
  articleSnippetList: [],
  searchData: searchInitialState,
  selectedData: selectedInitialState
};

const loggerMiddleware = createLogger();

export default function configureStore(initialState) {
  return createStore(
  rootReducer,
  initialState,
  applyMiddleware(
    thunkMiddleware,
    loggerMiddleware,
  ),
)};

