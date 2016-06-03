import {SNACKBAR_SHOW_MESSAGE, SNACKBAR_CLOSE} from '../actions/snackbar-actions'

export const initialState = {
    open: false,
    message: ''
}

export function snackbarReducer(state=initialState, action) {
    switch (action.type) {
    case SNACKBAR_SHOW_MESSAGE:
        return {
            open: true,
            message: action.message
        };
    case SNACKBAR_CLOSE:
        return {
            open: false,
            message: ''
        }
    default:
        return state;
    }
}

