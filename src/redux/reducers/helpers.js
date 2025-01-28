import { LOCATION_CHANGE } from 'react-router-redux';
import { UNAUTHENTICATED } from '../action-types';

export function patchObjectByKey(object, key, patcher) {
  return key in object ? { ...object, [key]: patcher(object[key]) } : object;
}

export function setOnLocationChange(targetState, excludePathnames = []) {
  return (state, action) => {
    if (action.type === LOCATION_CHANGE && !excludePathnames.includes(action.payload.pathname)) {
      return targetState;
    }
    return state;
  };
}

export function setOnLogOut(targetState) {
  return (state, action) => {
    if (action.type === UNAUTHENTICATED) {
      return targetState;
    }
    return state;
  };
}

export function reducersChain(...reducers) {
  return (state, action) => reducers.reduce((state, r) => r(state, action), state);
}

/**
 * @param {object} state
 * @param {{id: string}[]} list
 * @param {{insert: boolean, update: boolean}} [options]
 */
export function mergeByIds(state, list, { insert = true, update = false } = {}) {
  const needUpdate = list?.some((it) => (state[it.id] ? update : insert));
  if (!needUpdate) {
    return state;
  }

  const newState = { ...state };
  for (const it of list) {
    newState[it.id] = it;
  }
  return newState;
}
