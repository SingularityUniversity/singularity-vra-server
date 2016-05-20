import {CLOSE_CLIPBOARD, OPEN_CLIPBOARD, 
        TOGGLE_CLIPBOARD, ADD_SNIPPET_TO_CLIPBOARD,
        REMOVE_SNIPPET_FROM_CLIPBOARD} from '../actions/clipboard-actions';

export function clipboardVisibilityReducer(state=false, action) {
  console.log('clipboardVisibilityReducer called');
  switch(action.type) {
    case CLOSE_CLIPBOARD:
      return false;
    case OPEN_CLIPBOARD:
      return true;
    case TOGGLE_CLIPBOARD:
      return !state;
    default:
      return state;
  }
}

export function clipboardReducer(state=[], action) {
  switch(action.type) {
    case ADD_SNIPPET_TO_CLIPBOARD:
      return [];
    case REMOVE_SNIPPET_FROM_CLIPBOARD:
      return [];
    default:
      return state;
  }
}


