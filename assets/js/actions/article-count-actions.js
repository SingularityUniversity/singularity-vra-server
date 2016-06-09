export const RECEIVE_ARTICLE_COUNT = 'RECEIVE_ARTICLE_COUNT'

export function receiveArticleCount(count) {
    return {
        type: RECEIVE_ARTICLE_COUNT,
        count: count
    }

}
export function getArticleCount() {
    return function(dispatch) {
        fetch('/api/v1/content/count', {
            credentials: 'include'
        })
        .then(response => {
            if (response.status <= 299) {
                return response;
            } else {
                let error = new Error(response.statusText)
                error.response = response;
                throw error
            }
        })
        .then(response => response.json())
        .then(json => dispatch(receiveArticleCount(json.count)))
        .catch((error) => console.error(error));
    }
}

