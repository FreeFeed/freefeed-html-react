import { LOCATION_CHANGE } from 'react-router-redux';

export function patchObjectByKey(object, key, patcher) {
  return key in object ? { ...object, [key]: patcher(object[key]) } : object;
}

export function setOnLocationChange(targetState) {
  return (state, action) => {
    if (action.type === LOCATION_CHANGE) {
      return targetState;
    }
    return state;
  };
}
