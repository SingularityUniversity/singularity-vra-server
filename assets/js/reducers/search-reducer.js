import { KEYWORD_SEARCH, CLEAR_SEARCH } from '../actions/search-actions'

export function keywordSearchReducer(state=null, action) {
  switch (action.type) {
    case KEYWORD_SEARCH:
      return text;
    case CLEAR_SEARCH:
      return null;
    default:
      return state;
  }
}
