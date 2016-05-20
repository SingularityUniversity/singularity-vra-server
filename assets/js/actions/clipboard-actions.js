export const CLOSE_CLIPBOARD = 'CLOSE_CLIPBOARD'
export const OPEN_CLIPBOARD = 'OPEN_CLIPBOARD'
export const TOGGLE_CLIPBOARD = 'TOGGLE_CLIPBOARD'
export const ADD_SNIPPET_TO_CLIPBOARD = 'ADD_SNIPPET_TO_CLIPBOARD'
export const REMOVE_SNIPPET_FROM_CLIPBOARD = 'REMOVE_SNIPPET_FROM_CLIPBOARD'

export function closeClipboard() {
  console.log('closeClipboard action called');
  return {type: CLOSE_CLIPBOARD};
}

export function openClipboard() {
  return {type: OPEN_CLIPBOARD};
}

export function toggleClipboard() {
  return {type: TOGGLE_CLIPBOARD};
}

export function addSnippetToClipboard(snippet) {
  return {type: ADD_SNIPPET_TO_CLIPBOARD, snippet};
}

export function removeSnippetFromClipboard(snippet) {
  return {type: REMOVE_SNIPPET_FROM_CLIPBOARD, snippet};
}
