import React from 'react';
import {clearSelected} from './selected-actions';
import {showSnackbarMessage} from './snackbar-actions';
import $ from 'jquery';
export const KEYWORD_SEARCH = 'KEYWORD_SEARCH'
export const CLEAR_SEARCH = 'CLEAR_SEARCH'
export const ADD_SEARCH_RESULTS = 'ADD_SEARCH_RESULTS'
export const SIMILARITY_SEARCH = 'SIMILARITY_SEARCH'


let keywordSearchRequests = {};

export function keywordSearch(query, reset_selected, offset, limit) {
   
    return function(dispatch) {
        if (!offset) {
            offset=0;
        }
        if (!limit) {
            limit=50;
        }
        let data = `q=${query}&offset=${offset}&limit=${limit}`;
        if (data in keywordSearchRequests) {
          return;
        }
        keywordSearchRequests[data]=1;
        let promise=$.ajax({
            url: '/api/v1/search',
            data: data, 
            success: (data, textStatus, xhr) => {
                let entries = data.hits.hits.map(function(x) {return {score: x._score, ...x._source}});
                dispatch(addSearchResults(entries, offset, data.hits.total));
                if (reset_selected) {
                    dispatch(clearSelected());
                }
            },
            error: (xhr, textStatus, errorThrown) => {
              dispatch(showSnackbarMessage(xhr.responseText));
                console.log(`search error: ${textStatus}`);
            }
        }).always(function() {
          delete keywordSearchRequests[data];
        });
        return promise;
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
      dispatch(clearSelected());
      $.ajax({
        url: `/api/v1/similar`,
        method: 'POST',
        contentType: "application/json",
        data: JSON.stringify({'ids': contentIDs}),
        success: (data) => {
          let annotated_results = data.results.map(function(item) {
            var content = item.source;
            content.lda_similarity_topics = item.topics;
            content.score = item.weight;
            return content;
          });	
          // Only ever send one page of similarity search results for now
          dispatch(addSearchResults(annotated_results, 0, annotated_results.length, data.query_topics));
        },
        error: (xhr, status, err) => {
          console.log(xhr, status);
        }
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
    totalCount: totalCount,
  }
}
  
