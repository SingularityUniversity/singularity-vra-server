import { createStore, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import rootReducer from './reducers/root-reducer';
import {initialHistory as searchInitialState} from './reducers/search-reducer';
import {initialState as workspaceInitialState} from './reducers/workspace-reducer';
import {initialState as snackbarInitiateState} from './reducers/snackbar-reducer';

export const initialState = {
    clipboardVisibility: false,
    articleSnippetList: [],
    searchData: searchInitialState,
    workspaceData: workspaceInitialState,
    articleCount: 0,
    snackbar: snackbarInitiateState
};

const loggerMiddleware = createLogger();

export default function configureStore(initialState) {
    return createStore(rootReducer, initialState, 
        applyMiddleware(thunkMiddleware, loggerMiddleware));
}
