import {showSnackbarMessage} from './snackbar-actions';

export const CLOSE_CLIPBOARD = 'CLOSE_CLIPBOARD'
export const OPEN_CLIPBOARD = 'OPEN_CLIPBOARD'
export const TOGGLE_CLIPBOARD = 'TOGGLE_CLIPBOARD'
export const ADD_SNIPPET_TO_CLIPBOARD = 'ADD_SNIPPET_TO_CLIPBOARD'
export const REMOVE_SNIPPET_FROM_CLIPBOARD = 'REMOVE_SNIPPET_FROM_CLIPBOARD'
export const CLEAR_CLIPBOARD = 'CLEAR_CLIPBOARD'


export function clearClipboard() {
  return{type: CLEAR_CLIPBOARD};
}

export function closeClipboard() {
  return {type: CLOSE_CLIPBOARD};
}

export function openClipboard() {
  return {type: OPEN_CLIPBOARD};
}

export function toggleClipboard() {
  return {type: TOGGLE_CLIPBOARD};
}

export function addSnippetToClipboard(id, title, snippet) {
    return function(dispatch) {
      dispatch(showSnackbarMessage('Content copied to clipboard'));
      dispatch(putContentInClipboard(id, title, snippet));
    }
}

function putContentInClipboard(id, title, snippet) {
  return {
    type: ADD_SNIPPET_TO_CLIPBOARD, 
    id: id,
    title: title,
    snippet: snippet
  };
}

export function removeSnippetFromClipboard(id, snippet_index) {
  return {
    type: REMOVE_SNIPPET_FROM_CLIPBOARD, 
    id: id,
    snippet_index: snippet_index
  };
}
