export const KEYWORD_SEARCH = 'KEYWORD_SEARCH'
export const CLEAR_SEARCH = 'CLEAR_SEARCH'
export const ADD_SEARCH_RESULTS = 'ADD_SEARCH_RESULTS'
export const SIMILARITY_SEARCH = 'SIMILARITY_SEARCH'

export function keywordSearch(text) {
  return {
    type: KEYWORD_SEARCH,
    text: text
  }
}

export function similaritySearch(contentIDs) {
  return {
    type: SIMILARITY_SEARCH,
    contentIDs: contentIDs
  }
}

export function clearSearch() {
  return {type: CLEAR_SEARCH}
}

export function addSearchResults(results, start, totalCount, result_topics=[]) {
  return {
    type: ADD_SEARCH_RESULTS,
    results: results,
    resultTopics: result_topics,
    start: start,
    totalCount: totalCount,
  }
}
