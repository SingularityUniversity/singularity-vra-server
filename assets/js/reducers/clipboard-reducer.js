import $ from 'jquery';
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
      if (state.filter((value) => { return value == action.id; }).length > 0) {
        // append the snippet to the existing snippet list in the existing article
        return state.map((article, index) => {
          if (article.id == action.id) {
            return {
              id: action.id,
              title: action.title,
              snippets: article.snippets.slice().push(action.snippet)
            };
          } else {
            return article;
          }
        });
      } else {
        // just append a new article object
        return [
          ...state,
          {
            id: action.id,
            title: action.title,
            snippets: [action.snippet]
          }
        ];
      }
    case REMOVE_SNIPPET_FROM_CLIPBOARD:
      return [];
    default:
      return state;
  }
}


