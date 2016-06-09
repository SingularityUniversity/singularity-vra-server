let checkResponseAndExtractJSON = (response) => {
    if (response.status <= 299) {
        return response.json();
    } else {
        let error = new Error(response.statusText)
        error.response = response;
        throw error
    };
}

let checkResponse = (response) => {
    if (response.status <= 299) {
        return;
    } else {
        let error = new Error(response.statusText)
        error.response = response;
        throw error
    };
}
export {checkResponseAndExtractJSON, checkResponse};

