export const KEYWORD_SEARCH = 'KEYWORD_SEARCH'
export const CLEAR_SEARCH = 'CLEAR_SEARCH'

export function keywordSearch(text) {
  return {
    type: KEYWORD_SEARCH,
    text: text
  }
}

export function clearSearch() {
  return {type: CLEAR_SEARCH}
}
