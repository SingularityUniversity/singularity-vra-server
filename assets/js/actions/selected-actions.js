export const CLEAR_SELECTED = 'CLEAR_SELECTION'
export const SET_SELECTED = 'SET_SELECTED' 

export function clearSelected() {
  return {
    type: CLEAR_SELECTED
  }
}

export function setSelected(content, isSelected) {
  return {
    type: SET_SELECTED,
    content: content,
    isSelected: isSelected
  }
}

