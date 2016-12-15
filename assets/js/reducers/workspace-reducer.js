import Moment from 'moment'
import $ from 'jquery'
import {REPLACE_WORKSPACE, CLEAR_WORKSPACE, SET_IN_WORKSPACE, SORT_WORKSPACE,
        SET_FAVORITE} from '../actions/workspace-actions'
import {SortType, SortDirection} from '../constants/enums'

export const initialState = {
    id: null,
    title: '',
    description: '',
    articles: [],
    dirty: false,
    sortType: SortType.PUBLICATION_DATE,
    sortDirection: SortDirection.DESCENDING
}

function sortByKey(articles, key, direction) {
    let sortOrder = (direction == SortDirection.ASCENDING) ? 1 : -1;
    return articles.sort(function(x, y) {
        let xFavorite = x['fields']['favorite'];
        let yFavorite = y['fields']['favorite'];
        for (let i=0; i < key.length; i++) {
          x = x[key[i]];
          y = y[key[i]];
        }
        if (xFavorite == true && yFavorite == false) return -1
        else if (xFavorite == false && yFavorite == true) return 1
        else return sortOrder * ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });}

function sortWorkspace(articles, type, direction) {
    let articlesCopy = articles.slice();
    let keyMapping = [];
    keyMapping[SortType.PUBLICATION_DATE] = ['fields', 'article', 'extract', 'published'];
    keyMapping[SortType.RELEVANCE] = ['score'];
    keyMapping[SortType.ADDED_DATE] = ['fields', 'date_added'];
    return sortByKey(articlesCopy, keyMapping[type], direction);
}

export function workspaceReducer(state=initialState, action) {
    let content, inWorkspace, alreadyInWorkspace;
    switch (action.type) {
    case CLEAR_WORKSPACE:
        // XXX: Do we want to clear out the workspace title, id, and description too?
        return Object.assign({}, initialState);
    case SET_IN_WORKSPACE:

        content = action.content;
        inWorkspace = action.inWorkspace;
        if (!inWorkspace) {
                // Turn off membership in workspace - filter out if it somehow exists in the workspace
            let filteredInWorkspace = state.articles.filter(function(workspaceContent) {
                return (content.pk != workspaceContent.pk)
            });
            if (filteredInWorkspace.length != state.articles.length) {

                return Object.assign({}, state, {dirty: true, articles: filteredInWorkspace});
            } else {
                return state;
            }
        }
            // inWorkspace is true
        alreadyInWorkspace = false;
        state.articles.forEach(function(workspaceContent) {
            if (workspaceContent.pk == content.pk) {
                alreadyInWorkspace = true;
            }
        });

        if (!alreadyInWorkspace) {
            let newInWorkspace = state.articles.slice();
            let article = $.extend({}, content);
            let article_content = {
                article: article.fields,
                date_added: Moment().format('YYYY-MM-DDTHH:mm:ssZ'),
                favorite: false
            };
            article.fields = article_content;
            newInWorkspace.push(article);
            sortedArticles = sortWorkspace(newInWorkspace, state.sortType, state.SortDirection);
            return Object.assign({}, state, {dirty: true, articles: sortedArticles});
        } else {
            return state;
        }
    case REPLACE_WORKSPACE:
        action.workspace.articles = sortWorkspace(action.workspace.articles, 
            action.workspace.sortType, action.workspace.sortDirection)
        return Object.assign({}, {dirty: false}, action.workspace);
    case SORT_WORKSPACE:
        let sortDirection = SortDirection.DESCENDING;
        // determine if we need to change sort direction
        if (action.sortType == state.sortType) {
            sortDirection = (state.sortDirection == SortDirection.ASCENDING) ? 
                SortDirection.DESCENDING : 
                SortDirection.ASCENDING;            
        }
        // sort the articles in the workspace 
        let sortedArticles = sortWorkspace(state.articles, action.sortType, sortDirection);
        return Object.assign({}, state, {sortType: action.sortType, 
            sortDirection: sortDirection, articles: sortedArticles});
    case SET_FAVORITE:
        let newArticles = state.articles.filter((obj) => {
            return obj.pk !== action.content.pk;
        });
        let newContent = JSON.parse(JSON.stringify(action.content));
        newContent['fields']['favorite'] = !newContent['fields']['favorite'];
        newArticles.push(newContent);
        sortedArticles = sortWorkspace(newArticles, state.sortType, state.sortDirection);
        return Object.assign({}, state, {articles: sortedArticles});
    default:
        return state;
    }
}
