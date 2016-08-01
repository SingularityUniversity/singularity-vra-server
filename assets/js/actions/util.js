let checkResponseAndExtractJSON = (response) => {
    if (response.status <= 299) {
        return response.json();
    } else {
        return response.json().then((errorBody) => {
            let error;
            try {
                error = new Error(errorBody.detail)
                error.response = response;
            }
            catch(e) {
                console.log(e);
                throw new Error(response.statusText);
            }
            throw error;
        })
    }
}

let checkResponse = (response) => {
    if (response.status <= 299) {
        return;
    } else {
        return response.json().then((errorBody) => {
            let error;
            try {
                error = new Error(errorBody.detail)
                error.response = response;
            }
            catch(e) {
                console.log(e);
                throw new Error(response.statusText);
            }
            throw error;
        })
    }
}
export {checkResponseAndExtractJSON, checkResponse};

