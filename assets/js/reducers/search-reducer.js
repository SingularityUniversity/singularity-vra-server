import { KEYWORD_SEARCH, SIMILARITY_SEARCH, CLEAR_SEARCH, ADD_SEARCH_RESULTS } from '../actions/search-actions'

export const initialState = {
  searchResultData: [],
  searchResultTopics: [], // LDA query topics - [ [ [(term, weight),...], topicweight]...]
  searchResultTotalCount: 0,
  searchType: "",
  searchText: "",
  searchContentIDs: []
}

export function searchReducer(state=initialState, action) {
  switch (action.type) {
    case KEYWORD_SEARCH:
        return Object.assign({}, state,
            {
              searchType:"Keyword Search",
              searchText: action.text,
              searchResultData: [],
              searchResultTopics: [],
              searchResultTotalCount: 0,
              searchContentIDs: []
            });
    case SIMILARITY_SEARCH:
        return Object.assign({}, state,
            {
              searchType:"Similarity Search",
              searchText: "",
              searchResultData: [],
              searchResultTopics: [],
              searchResultTotalCount: 0,
              searchContentIDs: action.contentIDs 
            });

    case CLEAR_SEARCH:
        return initialState; 
    case ADD_SEARCH_RESULTS:
        //XXX: for now, just adds to the end of the list, could be buggy if not
        let start = action.start;
        let results = action.results;
        let totalCount = action.totalCount;
        let resultData = state.searchResultData.slice();
        let resultTopics = action.resultTopics;
        resultData.splice(start, 0, ...results);
        return  Object.assign({}, state, 
            { 
                //XXX: really we are adding at the start, but we assume this is the end
                searchResultData: resultData,
                searchResultTopics: resultTopics,
                searchResultTotalCount: totalCount,
            });
    default:
      return state;
  }
}
