export const SNACKBAR_SHOW_MESSAGE = 'SNACKBAR_SHOW_MESSAGE'
export const SNACKBAR_CLOSE = 'SNACKBAR_CLOSE'

export function closeSnackbar() {
    return {
        type: SNACKBAR_CLOSE
    }
}

export function showSnackbarMessage(message) {
    return {
        type: SNACKBAR_SHOW_MESSAGE,
        message: message
    }
}
