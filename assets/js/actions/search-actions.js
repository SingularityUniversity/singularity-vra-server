import React from 'react';
import {showSnackbarMessage} from './snackbar-actions';
import URLSearchParams from 'url-search-params';
import {checkResponseAndExtractJSON} from './util';
import {SortType, SortDirection} from '../constants/enums'

export const KEYWORD_SEARCH = 'KEYWORD_SEARCH'
export const CLEAR_SEARCH = 'CLEAR_SEARCH'
export const ADD_SEARCH_RESULTS = 'ADD_SEARCH_RESULTS'
export const SIMILARITY_SEARCH = 'SIMILARITY_SEARCH'
export const TOGGLE_SEARCH_RESULTS = 'TOGGLE_SEARCH_RESULTS'
export const SHOW_SEARCH_RESULTS = 'SHOW_SEARCH_RESULTS'
export const HIDE_SEARCH_RESULTS = 'HIDE_SEARCH_RESULTS'

const SortMapper = { 
    [SortType.PUBLICATION_DATE]: "published", 
    [SortType.RELEVANCE]:"relevance",
    [SortType.ADDED_DATE]: "created"
};

let keywordSearchRequests = {};

export function keywordSearch(query, offset, limit, sort_type, sort_direction) {

    return function(dispatch) {
        let promise = new Promise((resolve, reject) => {
            if (!offset) {
                offset=0;
            }
            if (!limit) {
                limit=50;
            }
            if (!sort_type) {
                sort_type = SortType.RELEVANCE; 
            }
            if (!sort_direction) {
                sort_direction = SortDirection.DESCENDING;
            }

            let sort_param = ( sort_direction == SortDirection.DESCENDING  ? "-" : "") +
                SortMapper[sort_type];


            // 'data' is *just* a key to keep us from doing multiple requests at the same time
            let data = `q=${query}&offset=${offset}&limit=${limit}&sort=${sort_param}`;
            if (data in keywordSearchRequests) {
                return;
            }
            keywordSearchRequests[data]=1;
            let params = new URLSearchParams();
            params.set('q', query);
            params.set('offset', offset);
            params.set('limit', limit);
            params.set('sort', sort_param);

            fetch(`/api/v1/search?${params.toString()}`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(checkResponseAndExtractJSON)
            .then(json => {
                let entries = json.hits.hits.map(function(x) {return {score: x._score, ...x._source}});
                delete keywordSearchRequests[data];
                if (offset == 0) {
                    let msg = ( <span> Did a content search with <em>{query}</em> </span>);
                    dispatch(showSnackbarMessage(msg));
                }

                dispatch(addSearchResults(entries, offset, json.hits.total));
                resolve();
            })
            .catch(error => {
                delete keywordSearchRequests[data];
                dispatch(showSnackbarMessage(error.message));
                reject(error);
            })
        })
        return promise ;
    }
}

export function startKeywordSearch(text, sortType, sortOrder) {
    return function(dispatch) {
        let msg = ( <span> Doing a content search with <em>{text}</em> </span>);
        dispatch(resetKeywordSearch(text, sortType, sortOrder));
        dispatch(showSnackbarMessage(msg));
    }
}

function resetKeywordSearch(text, sortType, sortOrder) {
    return {
        type: KEYWORD_SEARCH,
        text: text,
        sortType: sortType,
        sortOrder: sortOrder
    }
}

export function similaritySearch(contentIDs, since_timestamp) {
    return function(dispatch) {
        dispatch(startSimilaritySearch(contentIDs, since_timestamp));
        dispatch(showSnackbarMessage("Doing a similarity search"));
        let postContent = {
            'ids': contentIDs
        }
        if (since_timestamp) {
            postContent['since'] = since_timestamp
        }
        const finished = fetch('/api/v1/similar', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postContent)
        })
        .then(checkResponseAndExtractJSON)
        .then(json => {
            let annotated_results = json.results.map(item => {
                var content = item.source;
                content.lda_similarity_topics = item.topics;
                content.score = item.weight;
                return content;
            });
            dispatch(showSnackbarMessage("Did a similarity search"));
            // Only ever send one page of similarity search results for now
            dispatch(addSearchResults(annotated_results, 0, annotated_results.length, json.query_topics));
        })
        .catch(error => {
            dispatch(showSnackbarMessage("Error doing a similarity search"));
            console.error(error);
        });
        return finished;
    }
}

export function startSimilaritySearch(contentIDs, since_timestamp) {
    return {
        type: SIMILARITY_SEARCH,
        contentIDs: contentIDs,
        since: since_timestamp
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
        totalCount: totalCount
    }
}

export function toggleSearchResults() {
    return {
        type: TOGGLE_SEARCH_RESULTS
    }
}

export function hideSearchResults() {
    return {
        type: HIDE_SEARCH_RESULTS
    }
}

export function showSearchResults() {
    return {
        type: SHOW_SEARCH_RESULTS
    }
}

// This is not a reducer action, so do not call it with dispatch()
export function getSearchStats() {
       return fetch('/api/v1/search/stats', {
       credentials: 'include',
       headers: {'Accept': 'application/json'}
       }).
       then(checkResponseAndExtractJSON);

       /*
    const p = new Promise((resolve, reject) => resolve(
                {
                    top: [
                    {
                        query: "space", 
                        timestamp: 1468357363.743852,
                        count: 14,
                        result_count: 374
                    },
                    {
                        query: "space alien", 
                        timestamp: 1468357163.743852,
                        count: 10,
                        result_count: 127 
                    },

                    ],
                    recent: [
                    {
                        query: "space", 
                        timestamp: 1468357363.743852,
                        result_count: 374
                    },
                    {
                        query: "space alien", 
                        timestamp: 1468357163.743852,
                        result_count: 127 
                    },
                    ]
                }));
    return p;
    */
}
