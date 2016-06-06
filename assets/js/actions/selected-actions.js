export const CLEAR_WORKSPACE = 'CLEAR_WORKSPACE'
export const SET_IN_WORKSPACE = 'SET_IN_WORKSPACE' 

export function clearWorkspace() {
    return {
        type: CLEAR_WORKSPACE
    }
}

export function setInWorkspace(content, inWorkspace) {
    return {
        type: SET_IN_WORKSPACE,
        content: content,
        inWorkspace: inWorkspace 
    }
}

