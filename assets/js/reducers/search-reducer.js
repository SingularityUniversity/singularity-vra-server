import { KEYWORD_SEARCH, SIMILARITY_SEARCH, CLEAR_SEARCH, ADD_SEARCH_RESULTS } from '../actions/search-actions'
import undoable from 'redux-undo'

export const initialState= {
    searchResultData: [],
    searchResultTopics: [], // LDA query topics - [ [ [(term, weight),...], topicweight]...]
    searchResultTotalCount: 0,
    searchType: "",
    searchText: "",
    searchContentIDs: []
}

export const initialHistory= {
    past: [],
    present: Object.assign({}, initialState),
    future: []
}

function _searchReducer(state=initialState, action) {
    let start, results, totalCount, resultData, resultTopics
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
        start = action.start;
        results = action.results;
        totalCount = action.totalCount;
        resultData = state.searchResultData.slice();
        resultTopics = action.resultTopics;
        resultData.splice(start, 0, ...results);
        return  Object.assign({}, state, 
            { 
                        //XXX: really we are adding at the start, but we assume this is the end
                searchResultData: resultData,
                searchResultTopics: resultTopics,
                searchResultTotalCount: totalCount
            });
    default:
        return state;
    }
}

function newSearchResult(action, currentState, previousHistory) {
    if (!previousHistory) {
        return;
    }
    let present;
    // XXX There seems to be a bug in redux-undo where the filter gets passed the actual state, not the past/present/future structure,
    // in previousHistory, until the point when a history entry is created, then past/present/future structure is passed in
    if (previousHistory.present) { 
        present=previousHistory.present;
    } else {
        present = previousHistory;
    }
    return (((action.type == KEYWORD_SEARCH) || (action.type == CLEAR_SEARCH) || (action.type == SIMILARITY_SEARCH)) &&
            present.searchResultTotalCount != 0)
}

export let searchReducer = undoable(_searchReducer, {filter: newSearchResult})
