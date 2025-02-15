import { LOCATION_CHANGE } from 'react-router-redux';

import { CREATE_ATTACHMENT, UNAUTHENTICATED } from '../action-types';
import { asyncStatesMap, getKeyBy, response, request, reset, fail } from '../async-helpers';

const getKey = getKeyBy('uploadId');

export const attachmentUploadStatuses = asyncStatesMap(CREATE_ATTACHMENT, { getKey });

const defaultState = {};
export function attachmentUploads(state = defaultState, action) {
  switch (action.type) {
    case request(CREATE_ATTACHMENT): {
      const id = getKey(action);
      return {
        ...state,
        [id]: {
          ...state[id],
          name: action.payload.name,
          size: action.payload.size,
          attachment: null,
        },
      };
    }
    case fail(CREATE_ATTACHMENT): {
      const id = getKey(action);
      return {
        ...state,
        [id]: {
          ...state[id],
          name: action.request.name,
          attachment: null,
        },
      };
    }
    case response(CREATE_ATTACHMENT): {
      const id = getKey(action);
      return {
        ...state,
        [id]: {
          ...state[id],
          attachment: action.payload.attachments,
        },
      };
    }
    case reset(CREATE_ATTACHMENT): {
      const s = { ...state };
      delete s[getKey(action)];
      return s;
    }
    case LOCATION_CHANGE:
    case UNAUTHENTICATED: {
      return defaultState;
    }
    default:
      return state;
  }
}
