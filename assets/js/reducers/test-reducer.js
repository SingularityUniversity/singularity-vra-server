import { TEST_ACTION } from '../actions/test-action';

export function testReducer(state={}, action) {
  if (action.type == TEST_ACTION) {
    return true;
  } else {
    return state;
  }
}



