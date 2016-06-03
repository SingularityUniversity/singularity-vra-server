import {RECEIVE_ARTICLE_COUNT} from '../actions/article-count-actions';

export function articleCountReducer(state=0, action) {
    switch(action.type) {
    case RECEIVE_ARTICLE_COUNT:
        return action.count;
    default:
        return state;
    }
}

