import { KEYWORD_SEARCH, CLEAR_SEARCH } from '../actions/search-actions'

export function keywordSearchReducer(state=null, action) {
  switch (action.type) {
    case KEYWORD_SEARCH:
      return action.text;
    case CLEAR_SEARCH:
      return '';
    default:
      return state;
  }
}
