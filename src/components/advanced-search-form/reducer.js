import { omit } from 'lodash-es';

const SET = 'SET';
const REMOVE = 'REMOVE';

export function reducer(state, action) {
  switch (action.type) {
    case SET:
      return { ...state, [action.filter]: action.value };
    case REMOVE:
      return omit(state, action.filter);
    default:
      return state;
  }
}

export function setFilter(filter, value) {
  return { type: SET, filter, value };
}

export function removeFilter(filter) {
  return { type: REMOVE, filter };
}
