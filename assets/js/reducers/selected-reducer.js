import {CLEAR_SELECTED, SET_SELECTED} from '../actions/selected-actions'

export const initialState = [];

export function selectedReducer(state=initialState, action) {
    let content, isSelected, alreadySelected;
    switch (action.type) {
        case CLEAR_SELECTED:
            return [];
        case SET_SELECTED:
            content = action.content;
            isSelected = action.isSelected;
            if (!isSelected) { 
                // Turn off membership in selected - filter out if it somehow exists in the selected list
                let filtered_selected = state.filter(function(selected_content) {
                    return (content.pk != selected_content.pk)
                });
                if (filtered_selected.length != state.length) {
                    return (filtered_selected);
                } else {
                    return state;
                }
            }
            // isSelected is true
            alreadySelected = false;
            state.forEach(function(selected_content) {
                if (selected_content.pk == content.pk) {
                    alreadySelected = true;
                }
            });

            if (!alreadySelected) {
                let newSelected = state.slice();
                newSelected.push(content);
                return newSelected;
            } else {
                return state;
            }
        default:
            return state;
    }
}
