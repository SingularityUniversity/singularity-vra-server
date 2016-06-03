import $ from 'jquery';
export const RECEIVE_ARTICLE_COUNT = 'RECEIVE_ARTICLE_COUNT'

export function receiveArticleCount(count) {
    return {
        type: RECEIVE_ARTICLE_COUNT,
        count: count
    }
  
}
export function getArticleCount() {
    return function(dispatch) {
        $.ajax({
            url: '/api/v1/content/count',
            success: (data) => {
                dispatch(receiveArticleCount(data.count));
            },
            error: (xhr, status, err) => {   // eslint-disable-line no-unused-vars
                console.error(xhr, status);
            }
        });

    }
}

