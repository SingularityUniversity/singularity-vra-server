import React from 'react';
import {showSnackbarMessage} from './snackbar-actions';
import URLSearchParams from 'url-search-params';
import {checkResponseAndExtractJSON} from './util';
export const KEYWORD_SEARCH = 'KEYWORD_SEARCH'
export const CLEAR_SEARCH = 'CLEAR_SEARCH'
export const ADD_SEARCH_RESULTS = 'ADD_SEARCH_RESULTS'
export const SIMILARITY_SEARCH = 'SIMILARITY_SEARCH'


let keywordSearchRequests = {};

export function keywordSearch(query, offset, limit) {

    return function(dispatch) {
        if (!offset) {
            offset=0;
        }
        if (!limit) {
            limit=50;
        }

        // 'data' is *just* a key to keep us from doing multiple requests at the same time
        let data = `q=${query}&offset=${offset}&limit=${limit}`;
        if (data in keywordSearchRequests) {
            return;
        }
        keywordSearchRequests[data]=1;
        let params = new URLSearchParams();
        params.set('q', query);
        params.set('offset', offset);
        params.set('limit', limit);

        fetch(`/api/v1/search?${params.toString()}`, {
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }
        })
        .then(checkResponseAndExtractJSON)
        .then(json => {
            let entries = json.hits.hits.map(function(x) {return {score: x._score, ...x._source}});
            delete keywordSearchRequests[data];
            let msg = ( <span> Did a content search with <em>{query}</em> </span>);
            dispatch(showSnackbarMessage(msg));
            
            dispatch(addSearchResults(entries, offset, json.hits.total));
        })
        .catch(error => {
            delete keywordSearchRequests[data];
            dispatch(showSnackbarMessage(error));
            console.error(`search error: ${textStatus}`);
        })
    }
}

export function startKeywordSearch(text) {
    return function(dispatch) {
        let msg = ( <span> Doing a content search with <em>{text}</em> </span>);
        dispatch(resetKeywordSearch(text));
        dispatch(showSnackbarMessage(msg));
    }
}

function resetKeywordSearch(text) {
    return {
        type: KEYWORD_SEARCH,
        text: text
    }
}

export function similaritySearch(contentIDs) {
    return function(dispatch) {
        dispatch(startSimilaritySearch(contentIDs));
        dispatch(showSnackbarMessage("Doing a similarity search"));
        fetch('/api/v1/similar', {
            credentials: 'include',
            method: 'POST', 
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'ids': contentIDs}),
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
    }
}

export function startSimilaritySearch(contentIDs) {
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
        totalCount: totalCount
    }
}

