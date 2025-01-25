/* global CONFIG */
/* eslint-disable complexity */
import * as _ from 'lodash-es';
import { LOCATION_CHANGE } from 'react-router-redux';
import { combineReducers } from 'redux';

import { userParser, getSummaryPeriod } from '../utils';
import { parseQuery } from '../utils/search-highlighter-lib';
import { formatDateFromShortString } from '../utils/get-date-from-short-string';
import * as FeedOptions from '../utils/feed-options';
import {
  loadColorScheme,
  getSystemColorScheme,
  loadNSFWVisibility,
  loadUIScale,
  loadSubmitMode,
  loadOrbitDisabled,
} from '../services/appearance';
import { prefsToCriteria } from '../utils/hide-criteria';
import * as ActionTypes from './action-types';
import * as ActionHelpers from './action-helpers';
import { mergeByIds, patchObjectByKey, setOnLocationChange, setOnLogOut } from './reducers/helpers';
import {
  asyncStatesMap,
  getKeyBy,
  fromResponse,
  asyncState,
  initialAsyncState,
  successAsyncState,
  keyFromRequestPayload,
  baseType,
} from './async-helpers';

const frontendPrefsConfig = CONFIG.frontendPreferences;

const { request, response, fail } = ActionHelpers;

export const initialized = asyncState(ActionTypes.INITIAL_WHO_AM_I, (state, action) => {
  if (action.type === ActionTypes.UNAUTHENTICATED) {
    return successAsyncState;
  }
  return state;
});

export function title(state = '', action) {
  switch (action.type) {
    case response(ActionTypes.HOME): {
      return CONFIG.siteTitle;
    }
    case response(ActionTypes.DIRECT): {
      return `Direct messages - ${CONFIG.siteTitle}`;
    }
    case response(ActionTypes.DISCUSSIONS): {
      return `My discussions - ${CONFIG.siteTitle}`;
    }
    case response(ActionTypes.SAVES): {
      return `Saved posts - ${CONFIG.siteTitle}`;
    }
    case response(ActionTypes.GET_BEST_OF): {
      return `Best Of ${CONFIG.siteTitle}`;
    }
    case response(ActionTypes.GET_EVERYTHING): {
      return `Everything On ${CONFIG.siteTitle}`;
    }
    case response(ActionTypes.GET_NOTIFICATIONS): {
      return `Notifications - ${CONFIG.siteTitle}`;
    }
    case response(ActionTypes.GET_SEARCH): {
      return `Search - ${CONFIG.siteTitle}`;
    }
    case response(ActionTypes.GET_USER_FEED): {
      const user = action.payload.users.find((user) => user.id === action.payload.timelines.user);
      const author =
        user.screenName + (user.username !== user.screenName ? ` (${user.username})` : '');
      return `${author} - ${CONFIG.siteTitle}`;
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      const text = action.payload.posts.body.slice(0, 60);
      const [user] = action.payload.users || [];
      const author =
        user.screenName + (user.username !== user.screenName ? ` (${user.username})` : '');
      return `${text} - ${author} - ${CONFIG.siteTitle}`;
    }
    case response(ActionTypes.GET_SUMMARY): {
      const period = getSummaryPeriod(action.request.days);
      return `Best of ${period} - ${CONFIG.siteTitle}`;
    }
    case response(ActionTypes.GET_USER_SUMMARY): {
      const period = getSummaryPeriod(action.request.days);
      const user = (action.payload.users || []).find(
        (user) => user.username === action.request.username,
      );
      const author = user
        ? user.screenName + (user.username !== user.screenName ? ` (${user.username})` : '')
        : action.request.username;
      return `Best of ${period} - ${author} - ${CONFIG.siteTitle}`;
    }
    case fail(ActionTypes.HOME):
    case fail(ActionTypes.DIRECT):
    case fail(ActionTypes.DISCUSSIONS):
    case fail(ActionTypes.SAVES):
    case fail(ActionTypes.GET_USER_FEED):
    case fail(ActionTypes.GET_SINGLE_POST): {
      return `Error - ${CONFIG.siteTitle}`;
    }

    case ActionTypes.STATIC_PAGE: {
      return `${action.payload.title} - ${CONFIG.siteTitle}`;
    }
  }
  return state;
}

export const signInStatus = asyncState(ActionTypes.SIGN_IN, setOnLocationChange(initialAsyncState));

export const signUpStatus = asyncState(ActionTypes.SIGN_UP, setOnLocationChange(initialAsyncState));

export const restorePasswordStatus = asyncState(
  ActionTypes.RESTORE_PASSWORD,
  setOnLocationChange(initialAsyncState),
);

const defaultResetHeader = `Reset ${CONFIG.siteTitle} Password`;
const successResetHeader = 'Please log in with your new password';

const defaultPassFormState = { error: '', loading: false, header: defaultResetHeader };

export function resetPassForm(state = defaultPassFormState, action) {
  switch (action.type) {
    case request(ActionTypes.RESET_PASSWORD): {
      return { ...state, loading: true, header: defaultResetHeader };
    }
    case response(ActionTypes.RESET_PASSWORD): {
      return { ...state, loading: false, header: successResetHeader };
    }
    case ActionTypes.RESET_PASSWORD_VALIDATION_FAIL: {
      return { ...state, error: action.error, loading: false };
    }
    case fail(ActionTypes.RESET_PASSWORD): {
      return { ...state, error: (action.payload || {}).err, loading: false };
    }
  }
  return state;
}

export const currentInvitationStatus = asyncState(ActionTypes.GET_INVITATION, (state, action) => {
  if (action.type === response(ActionTypes.SIGN_UP)) {
    return initialAsyncState;
  }
  return state;
});
export const currentInvitation = fromResponse(
  ActionTypes.GET_INVITATION,
  (action) => action.payload.invitation,
);

export const createPostStatus = asyncState(ActionTypes.CREATE_POST);
export const lastCreatedPostId = fromResponse(
  ActionTypes.CREATE_POST,
  (action) => action.payload.posts.id,
);

const initFeed = {
  entries: [],
  timeline: null,
  recentlyHiddenEntries: {},
  isHiddenRevealed: false,
  isLastPage: true,
  feedError: null,
  feedRequestType: null,
};

export function feedViewState(state = initFeed, action) {
  if (ActionHelpers.isFeedRequest(action)) {
    return state;
  }
  if (ActionHelpers.isFeedResponse(action)) {
    const entries = (action.payload.posts || []).map((post) => post.id);
    const recentlyHiddenEntries = {};
    const isHiddenRevealed = false;
    const { isLastPage } = action.payload;
    const timeline = action.payload.timelines
      ? _.pick(action.payload.timelines, ['id', 'name', 'user'])
      : null;
    const feedRequestType = baseType(action.type);

    const extras =
      baseType(action.type) === ActionTypes.CALENDAR_DATE_POSTS
        ? {
            previousDay: action.payload.previousDay,
            nextDay: action.payload.nextDay,
          }
        : {};

    return {
      ...initFeed,
      ...extras,
      entries,
      recentlyHiddenEntries,
      timeline,
      isHiddenRevealed,
      isLastPage,
      feedRequestType,
    };
  }
  if (ActionHelpers.isFeedFail(action)) {
    return { ...initFeed, feedError: action.payload.err };
  }

  switch (action.type) {
    case ActionTypes.UNAUTHENTICATED: {
      return initFeed;
    }
    case response(ActionTypes.GET_NOTIFICATIONS): {
      return { ...state, isLastPage: action.payload.isLastPage };
    }
    case response(ActionTypes.DELETE_POST): {
      const { postId } = action.request;
      if (action.payload.postStillAvailable || !state.entries.includes(postId)) {
        return state;
      }
      return {
        ...state,
        entries: _.without(state.entries, postId),
      };
    }
    case ActionTypes.REALTIME_POST_DESTROY: {
      if (!state.entries.includes(action.postId)) {
        return state;
      }
      return {
        ...state,
        entries: _.without(state.entries, action.postId),
      };
    }
    case response(ActionTypes.LEAVE_DIRECT): {
      const postId = action.request;
      if (!state.entries.includes(postId)) {
        return state;
      }
      return {
        ...state,
        entries: _.without(state.entries, postId),
      };
    }
    case response(ActionTypes.CREATE_POST): {
      const postId = action.payload.posts.id;
      if (state.entries.includes(postId)) {
        return state;
      }
      return {
        ...state,
        entries: [postId, ...state.entries],
      };
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      const { id: postId } = action.payload.posts;
      return {
        ...initFeed,
        entries: [postId],
      };
    }
    case ActionTypes.REALTIME_POST_NEW: {
      if (state.entries.includes(action.post.id) || !action.shouldBump) {
        return state;
      }

      let { entries } = state;
      const p = entries.indexOf(action.insertBefore);
      if (p < 0) {
        entries = [...entries, action.post.id];
      } else {
        entries = [...entries.slice(0, p), action.post.id, ...entries.slice(p)];
      }

      return { ...state, entries };
    }
    case ActionTypes.REALTIME_LIKE_NEW:
    case ActionTypes.REALTIME_COMMENT_NEW: {
      if (action.post && action.shouldBump && !state.entries.includes(action.post.posts.id)) {
        const postId = action.post.posts.id;
        return {
          ...state,
          entries: [postId, ...state.entries],
        };
      }
      return state;
    }
    case fail(ActionTypes.GET_SINGLE_POST): {
      return initFeed;
    }
    // Recently hidden entries updates only by local events, not by realtime
    case response(ActionTypes.HIDE_POST): {
      const { postId } = action.request;
      if (state.recentlyHiddenEntries[postId]) {
        return state;
      }
      return {
        ...state,
        recentlyHiddenEntries: {
          ...state.recentlyHiddenEntries,
          [postId]: true,
        },
      };
    }

    // Hide by username
    case response(ActionTypes.HIDE_BY_CRITERION): {
      const { postId, hide } = action.request;
      if (postId) {
        if (hide && !state.recentlyHiddenEntries[postId]) {
          return {
            ...state,
            recentlyHiddenEntries: {
              ...state.recentlyHiddenEntries,
              [postId]: true,
            },
          };
        }
      }
      return state;
    }

    case ActionTypes.REMOVE_RECENTLY_HIDDEN_POST: {
      const { postId } = action.payload;
      if (!state.recentlyHiddenEntries[postId]) {
        return state;
      }
      return {
        ...state,
        recentlyHiddenEntries: _.omit(state.recentlyHiddenEntries, postId),
      };
    }

    case ActionTypes.TOGGLE_HIDDEN_POSTS: {
      return {
        ...state,
        isHiddenRevealed: !state.isHiddenRevealed,
      };
    }
  }
  return state;
}

export const saveEditingPostStatuses = asyncStatesMap(
  ActionTypes.SAVE_EDITING_POST,
  { getKey: getKeyBy('postId'), cleanOnSuccess: true },
  setOnLocationChange({}),
);

const NO_ERROR = {
  isError: false,
  errorString: '',
};

const POST_SAVE_ERROR = 'Something went wrong while editing the post...';

const initPostViewState = (post) => {
  const { id, omittedLikes } = post;

  return {
    id,
    omittedLikes,
    isEditing: false,
    isCommenting: false,
    commentText: '',
    justCreated: false,
    ...NO_ERROR,
  };
};

export function postsViewState(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return mergeByIds(state, (action.payload.posts || []).map(initPostViewState), {
      insert: true,
      update: true,
    });
  }
  switch (action.type) {
    case response(ActionTypes.SHOW_MORE_LIKES_ASYNC): {
      const { id } = action.payload.posts;
      const omittedLikes = 0;

      return { ...state, [id]: { ...state[id], omittedLikes, ...NO_ERROR } };
    }
    case request(ActionTypes.SHOW_MORE_COMMENTS): {
      const id = action.payload.postId;
      const isLoadingComments = true;

      return { ...state, [id]: { ...state[id], isLoadingComments } };
    }
    case response(ActionTypes.SHOW_MORE_COMMENTS): {
      const { id } = action.payload.posts;
      const isLoadingComments = false;

      return { ...state, [id]: { ...state[id], isLoadingComments, ...NO_ERROR } };
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      const { id } = action.payload.posts;
      return { ...state, [id]: initPostViewState(action.payload.posts) };
    }
    case ActionTypes.REALTIME_POST_NEW:
    case ActionTypes.REALTIME_POST_UPDATE: {
      const { id } = action.post;
      const postAlreadyAdded = !!state[id];
      if (postAlreadyAdded) {
        return state;
      }
      return { ...state, [id]: initPostViewState(action.post) };
    }
    case fail(ActionTypes.GET_SINGLE_POST): {
      const id = action.request.postId;
      const isEditing = false;

      const isError = true;
      const errorString = `${action.response?.status || '000'}: ${action.payload.err}`;

      return { ...state, [id]: { id, isEditing, isError, errorString } };
    }
    case ActionTypes.SHOW_MORE_LIKES_SYNC: {
      const id = action.payload.postId;
      const omittedLikes = 0;

      return { ...state, [id]: { ...state[id], omittedLikes, ...NO_ERROR } };
    }
    case ActionTypes.TOGGLE_EDITING_POST: {
      const id = action.payload.postId;
      const isEditing = !state[id].isEditing;

      return { ...state, [id]: { ...state[id], isEditing, ...NO_ERROR } };
    }
    case ActionTypes.CANCEL_EDITING_POST: {
      const id = action.payload.postId;
      const isEditing = false;

      return { ...state, [id]: { ...state[id], isEditing, ...NO_ERROR } };
    }
    case request(ActionTypes.SAVE_EDITING_POST): {
      const id = action.payload.postId;
      return { ...state, [id]: { ...state[id], isSaving: true } };
    }
    case response(ActionTypes.SAVE_EDITING_POST): {
      const { id } = action.payload.posts;
      const isEditing = false;
      const isSaving = false;

      return { ...state, [id]: { ...state[id], isEditing, isSaving, ...NO_ERROR } };
    }
    case fail(ActionTypes.SAVE_EDITING_POST): {
      const id = action.request.postId;
      const isEditing = true;
      const isSaving = false;

      const isError = true;

      return {
        ...state,
        [id]: {
          ...state[id],
          isEditing,
          isSaving,
          isError,
          errorString: action.payload.err || POST_SAVE_ERROR,
        },
      };
    }
    case fail(ActionTypes.DELETE_POST): {
      const id = action.request.postId;

      const isError = true;
      const errorString = 'Something went wrong while deleting the post...';

      return { ...state, [id]: { ...state[id], isError, errorString } };
    }
    case ActionTypes.TOGGLE_COMMENTING: {
      const { postId, newCommentText = '' } = action.payload;
      return {
        ...state,
        [postId]: {
          ...state[postId],
          isCommenting: !state[postId].isCommenting,
          newCommentText,
        },
      };
    }
    case request(ActionTypes.ADD_COMMENT): {
      const post = state[action.payload.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isSavingComment: true,
        },
      };
    }
    case response(ActionTypes.ADD_COMMENT): {
      const post = state[action.request.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isCommenting: false,
          isSavingComment: false,
          newCommentText: '',
        },
      };
    }
    case fail(ActionTypes.ADD_COMMENT): {
      const post = state[action.request.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isSavingComment: false,
        },
      };
    }
    case ActionTypes.REALTIME_COMMENT_NEW: {
      const post = state[action.comment.postId];
      if (!post) {
        if (!action.post) {
          return state;
        }

        return {
          ...state,
          [action.post.posts.id]: initPostViewState(action.post.posts),
        };
      }
      return state;
    }
    case ActionTypes.REALTIME_LIKE_NEW: {
      if (action.post && !state[action.post.id]) {
        return {
          ...state,
          [action.post.posts.id]: initPostViewState(action.post.posts),
        };
      }
      return state;
    }

    case ActionTypes.REALTIME_LIKE_REMOVE: {
      const { postId, isLikeVisible } = action;
      const post = state[postId];
      if (!post) {
        return state;
      }
      return {
        ...state,
        [post.id]: {
          ...post,
          omittedLikes: isLikeVisible ? post.omittedLikes : Math.max(0, post.omittedLikes - 1),
        },
      };
    }

    case ActionTypes.TOGGLE_MODERATING_COMMENTS: {
      const post = state[action.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isModeratingComments: !post.isModeratingComments,
        },
      };
    }

    case request(ActionTypes.DISABLE_COMMENTS): {
      const post = state[action.payload.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isDisablingComments: true,
        },
      };
    }
    case response(ActionTypes.DISABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isDisablingComments: false,
          commentsDisabled: true,
        },
      };
    }
    case fail(ActionTypes.DISABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isDisablingComments: false,
          disableCommentsError: 'Something went wrong while disabling comments.',
        },
      };
    }

    case request(ActionTypes.ENABLE_COMMENTS): {
      const post = state[action.payload.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isDisablingComments: true,
        },
      };
    }
    case response(ActionTypes.ENABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isDisablingComments: false,
          commentsDisabled: false,
        },
      };
    }
    case fail(ActionTypes.ENABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isDisablingComments: false,
          disableCommentsError: 'Something went wrong while enabling comments.',
        },
      };
    }

    case response(ActionTypes.CREATE_POST): {
      const post = action.payload.posts;
      return { ...state, [post.id]: { ...initPostViewState(post), justCreated: true } };
    }
    case ActionTypes.UNAUTHENTICATED: {
      return {};
    }
  }

  return state;
}

export { posts } from './reducers/posts';

export const postHideStatuses = asyncStatesMap(
  [
    ActionTypes.HIDE_POST,
    ActionTypes.UNHIDE_POST,
    ActionTypes.HIDE_BY_CRITERION,
    ActionTypes.UNHIDE_CRITERIA,
  ],
  { getKey: getKeyBy('postId'), cleanOnSuccess: true },
);

export function attachments(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return mergeByIds(state, action.payload.attachments, { update: true });
  }
  switch (action.type) {
    case response(ActionTypes.GET_SINGLE_POST):
    case response(ActionTypes.COMPLETE_POST_COMMENTS):
    case response(ActionTypes.CREATE_POST): {
      return mergeByIds(state, action.payload.attachments, { update: true });
    }
    case ActionTypes.REALTIME_POST_NEW:
    case ActionTypes.REALTIME_POST_UPDATE: {
      return mergeByIds(state, action.attachments, { update: true });
    }
    case ActionTypes.REALTIME_COMMENT_NEW:
    case ActionTypes.REALTIME_LIKE_NEW: {
      if (action.post && action.post.attachments) {
        return mergeByIds(state, action.post.attachments, { update: true });
      }
      return state;
    }
    case ActionTypes.REALTIME_ATTACHMENT_UPDATE: {
      return mergeByIds(state, [action.attachments], { update: true });
    }
    case response(ActionTypes.CREATE_ATTACHMENT):
    case response(ActionTypes.GET_ATTACHMENT_INFO):
    case ActionTypes.SET_ATTACHMENT:
    case ActionTypes.ADD_ATTACHMENT_RESPONSE: {
      const attObj = action.payload.attachments;
      return {
        ...state,
        [attObj.id]: attObj,
      };
    }
  }
  return state;
}

function updateCommentData(state, action) {
  return mergeByIds(state, action.payload.comments, { insert: true, update: true });
}

export function comments(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return updateCommentData(state, action);
  }
  switch (action.type) {
    case response(ActionTypes.SHOW_MORE_COMMENTS):
    case response(ActionTypes.COMPLETE_POST_COMMENTS):
    case response(ActionTypes.GET_SINGLE_POST):
    case response(ActionTypes.SHOW_MORE_LIKES_ASYNC):
    case response(ActionTypes.GET_COMMENTS_BY_IDS): {
      return updateCommentData(state, action);
    }
    case response(ActionTypes.GET_COMMENT_BY_NUMBER): {
      return {
        ...state,
        [action.payload.comments.id]: {
          ...state[action.payload.comments.id],
          ...action.payload.comments,
          isExpanded: true,
        },
      };
    }
    case response(ActionTypes.SAVE_EDITING_COMMENT): {
      return {
        ...state,
        [action.payload.comments.id]: {
          ...state[action.payload.comments.id],
          ...action.payload.comments,
          isExpanded: true,
        },
      };
    }
    case response(ActionTypes.DELETE_COMMENT): {
      return { ...state, [action.request.commentId]: undefined };
    }
    case ActionTypes.REALTIME_COMMENT_NEW: {
      //we already have that comment
      if (action.comment && state[action.comment.id]) {
        return state;
      }
      if (action.post) {
        return mergeByIds(state, [action.comment, ...action.post.comments]);
      }
      return mergeByIds(state, [action.comment]);
    }
    case ActionTypes.REALTIME_POST_NEW: {
      return mergeByIds(state, action.comments);
    }
    case ActionTypes.REALTIME_LIKE_NEW: {
      if (action.post) {
        return mergeByIds(state, action.post.comments);
      }
      return state;
    }
    case ActionTypes.REALTIME_COMMENT_UPDATE: {
      const newComment = {
        ...action.comment,
        isExpanded: (state[action.comment.id] || {}).isExpanded,
      };
      return mergeByIds(state, [newComment], { insert: false, update: true });
    }
    case ActionTypes.REALTIME_COMMENT_DESTROY: {
      if (!state[action.commentId]) {
        return state;
      }
      return _.omit(state, action.commentId);
    }
    case response(ActionTypes.ADD_COMMENT): {
      return {
        ...state,
        [action.payload.comments.id]: { ...action.payload.comments, isExpanded: true },
      };
    }
    case request(ActionTypes.LIKE_COMMENT): {
      const comment = state[action.payload.commentId];
      return {
        ...state,
        [action.payload.commentId]: { ...comment, likes: comment.likes + 1, hasOwnLike: true },
      };
    }
    case fail(ActionTypes.LIKE_COMMENT): {
      const comment = state[action.request.commentId];
      return {
        ...state,
        [action.payload.commentId]: { ...comment, likes: comment.likes - 1, hasOwnLike: false },
      };
    }
    case request(ActionTypes.UNLIKE_COMMENT): {
      const comment = state[action.payload.commentId];
      return {
        ...state,
        [action.payload.commentId]: { ...comment, likes: comment.likes - 1, hasOwnLike: false },
      };
    }
    case fail(ActionTypes.UNLIKE_COMMENT): {
      const comment = state[action.request.commentId];
      return {
        ...state,
        [action.payload.commentId]: { ...comment, likes: comment.likes + 1, hasOwnLike: true },
      };
    }
  }
  return state;
}

export { commentEditState } from './reducers/comment-edit.js';

const loadLikesListStatusesReducer = asyncStatesMap(ActionTypes.GET_COMMENT_LIKES, {
  getKey: getKeyBy('commentId'),
  applyState: (comment, status) => ({ ...comment, status }),
});

const commentLikesInitial = {};

export function commentLikes(state = commentLikesInitial, action) {
  state = loadLikesListStatusesReducer(state, action);

  switch (action.type) {
    case response(ActionTypes.GET_COMMENT_LIKES): {
      return patchObjectByKey(state, action.request.commentId, (comment) => ({
        ...comment,
        likes: action.payload.likes,
      }));
    }
    case LOCATION_CHANGE: {
      // Clean state on page navigation
      return commentLikesInitial;
    }
  }

  return state;
}

export function usersNotFound(state = [], action) {
  switch (action.type) {
    case fail(ActionTypes.GET_USER_INFO): {
      if (action.response?.status === 404) {
        const username = action.request.username.toLowerCase();
        if (!state.includes(username)) {
          state = [...state, username];
        }
        return state;
      }
    }
  }
  return state;
}

export function userPastNames(state = {}, action) {
  switch (action.type) {
    case response(ActionTypes.GET_USER_INFO): {
      const names = action.payload.pastUsernames?.map((r) => r.username) || [];
      if (names.some((name) => !state[name])) {
        const newState = { ...state };
        const userId = action.payload.users.id;
        for (const name of names) {
          newState[name] = userId;
        }
        return newState;
      }
    }
  }
  return state;
}

export function users(state = {}, action) {
  const mergeAccounts = (accounts, options = {}) =>
    mergeByIds(state, (accounts || []).map(userParser), options);

  if (ActionHelpers.isFeedResponse(action)) {
    return mergeAccounts([...action.payload.users, ...action.payload.subscribers], {
      insert: true,
      update: true,
    });
  }
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return mergeAccounts([action.payload.users, ...action.payload.subscribers]);
    }
    case response(ActionTypes.GET_USER_INFO): {
      return mergeAccounts([action.payload.users, ...action.payload.admins], { update: true });
    }
    case response(ActionTypes.GET_COMMENT_BY_NUMBER): {
      return mergeAccounts([action.payload.users, ...action.payload.admins], { update: true });
    }
    case response(ActionTypes.CREATE_GROUP): {
      return mergeAccounts([action.payload.groups]);
    }
    case response(ActionTypes.DISABLE_BANS_IN_GROUP):
    case response(ActionTypes.ENABLE_BANS_IN_GROUP): {
      return mergeAccounts([action.payload.users, ...action.payload.admins], { update: true });
    }
    case response(ActionTypes.UPDATE_GROUP): {
      return mergeAccounts([action.payload.groups], { update: true });
    }
    case response(ActionTypes.GET_COMMENT_LIKES): {
      return mergeAccounts(action.payload.users);
    }
    case response(ActionTypes.GET_NOTIFICATIONS):
    case response(ActionTypes.SHOW_MORE_COMMENTS):
    case response(ActionTypes.SHOW_MORE_LIKES_ASYNC):
    case response(ActionTypes.GET_SINGLE_POST):
    case response(ActionTypes.COMPLETE_POST_COMMENTS):
    case response(ActionTypes.GET_ALL_SUBSCRIPTIONS):
    case response(ActionTypes.GET_GROUP_BLOCKED_USERS):
    case response(ActionTypes.BLOCK_USER_IN_GROUP):
    case response(ActionTypes.UNBLOCK_USER_IN_GROUP): {
      return mergeAccounts([
        ...action.payload.users,
        ...(action.payload.subscribers || []),
        ...(action.payload.groups || []),
      ]);
    }
    case response(ActionTypes.GET_INVITATION): {
      return mergeAccounts([...(action.payload.users || []), ...(action.payload.groups || [])]);
    }
    case ActionTypes.REALTIME_POST_NEW:
    case ActionTypes.REALTIME_LIKE_NEW:
    case ActionTypes.REALTIME_COMMENT_NEW: {
      return mergeAccounts([
        ...action.users,
        ...(action.subscribers || []),
        ...(action.post?.users || []),
      ]);
    }
    case ActionTypes.UNAUTHENTICATED: {
      return {};
    }
    case ActionTypes.REALTIME_GLOBAL_USER_UPDATE: {
      return mergeAccounts([action.user], { insert: false, update: true });
    }
    case ActionTypes.REALTIME_USER_UPDATE: {
      return mergeAccounts(action.updatedGroups || [], { insert: true, update: true });
    }
    case response(ActionTypes.GET_ALL_GROUPS):
    case response(ActionTypes.GET_MATCHED_USERS): {
      return mergeAccounts(action.payload.users);
    }
    case response(ActionTypes.BLOCKED_BY_ME): {
      return mergeAccounts(action.payload);
    }
  }
  return state;
}

export function subscribers(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return mergeByIds(state, (action.payload.subscribers || []).map(userParser), {
      insert: true,
      update: true,
    });
  }
  switch (action.type) {
    case ActionTypes.REALTIME_POST_NEW:
    case ActionTypes.REALTIME_COMMENT_NEW:
    case ActionTypes.REALTIME_LIKE_NEW: {
      const subscribers = !action.post
        ? action.subscribers || []
        : [...(action.subscribers || []), ...(action.post.subscribers || [])];
      return mergeByIds(state, (subscribers || []).map(userParser));
    }
    case response(ActionTypes.WHO_AM_I):
    case response(ActionTypes.GET_SINGLE_POST):
    case response(ActionTypes.COMPLETE_POST_COMMENTS):
    case response(ActionTypes.CREATE_POST): {
      return mergeByIds(state, (action.payload.subscribers || []).map(userParser));
    }
  }
  return state;
}

export function authenticated(state = false, action) {
  switch (action.type) {
    case response(ActionTypes.INITIAL_WHO_AM_I): {
      return true;
    }
    case response(ActionTypes.SIGN_UP): {
      return true;
    }
    case ActionTypes.UNAUTHENTICATED: {
      return false;
    }
  }
  return state;
}

const initUser = () => ({ frontendPreferences: frontendPrefsConfig.defaultValues });

export function user(state = initUser(), action) {
  if (ActionHelpers.isUserChangeResponse(action)) {
    const subscriptions = _.uniq((action.payload.subscriptions || []).map((sub) => sub.user));
    return { ...state, ...userParser(action.payload.users), subscriptions };
  }
  switch (action.type) {
    case response(ActionTypes.SEND_SUBSCRIPTION_REQUEST): {
      return {
        ...state,
        pendingSubscriptionRequests: [
          ...(state.pendingSubscriptionRequests || []),
          action.request.id,
        ],
      };
    }
    case response(ActionTypes.REVOKE_USER_REQUEST): {
      return {
        ...state,
        pendingSubscriptionRequests: _.without(
          state.pendingSubscriptionRequests || [],
          action.request.id,
        ),
      };
    }
    case response(ActionTypes.DIRECTS_ALL_READ): {
      return { ...state, unreadDirectsNumber: 0 };
    }
    case response(ActionTypes.NOTIFICATIONS_ALL_READ): {
      return { ...state, unreadNotificationsNumber: 0 };
    }
    case ActionTypes.REALTIME_USER_UPDATE: {
      return { ...state, ...action.user };
    }
    case response(ActionTypes.BAN): {
      return { ...state, banIds: [...state.banIds, action.request.id] };
    }
    case response(ActionTypes.UNBAN): {
      return { ...state, banIds: _.without(state.banIds, action.request.id) };
    }
    case response(ActionTypes.CREATE_GROUP): {
      return { ...state, subscriptions: [...state.subscriptions, action.payload.groups.id] };
    }
    case response(ActionTypes.ARCHIVE_ACTIVITY_REQUEST): {
      return {
        ...state,
        privateMeta: {
          ...state.privateMeta,
          archives: {
            ...state.privateMeta.archives,
            restore_comments_and_likes: true,
          },
        },
      };
    }
    case response(ActionTypes.ARCHIVE_RESTORATION_REQUEST): {
      return {
        ...state,
        privateMeta: {
          ...state.privateMeta,
          archives: {
            ...state.privateMeta.archives,
            recovery_status: 1,
          },
        },
      };
    }
    case ActionTypes.REALTIME_INCOMING_EVENT: {
      if (action.payload.event === 'event:new') {
        const { Notifications, users, groups } = action.payload.data;
        for (const note of Notifications) {
          if (note.event_type === 'subscription_request_approved') {
            const user = users.find((u) => u.id === note.created_user_id);
            if (!(user.id in state.subscriptions)) {
              return {
                ...state,
                subscriptions: [...state.subscriptions, user.id],
                pendingSubscriptionRequests: _.without(
                  state.pendingSubscriptionRequests || [],
                  user.id,
                ),
              };
            }
          } else if (note.event_type === 'group_subscription_approved') {
            const group = groups.find((g) => g.id === note.group_id);
            if (!state.subscriptions.includes(group.id)) {
              return {
                ...state,
                subscriptions: [...state.subscriptions, group.id],
                pendingSubscriptionRequests: _.without(
                  state.pendingSubscriptionRequests || [],
                  group.id,
                ),
              };
            }
          } else if (note.event_type === 'subscription_requested') {
            const user = users.find((u) => u.id === note.created_user_id);
            if (!state.subscriptionRequests.includes(user.id)) {
              return {
                ...state,
                subscriptionRequests: [...state.subscriptionRequests, user.id],
              };
            }
          } else if (note.event_type === 'subscription_request_revoked') {
            const user = users.find((u) => u.id === note.created_user_id);
            if (state.subscriptionRequests.includes(user.id)) {
              return {
                ...state,
                subscriptionRequests: _.without(state.subscriptionRequests, user.id),
              };
            }
          }
        }
      }
      return state;
    }
    case ActionTypes.REALTIME_GLOBAL_USER_UPDATE: {
      const userId = action.user.id;
      if (state.id === userId) {
        const newUser = userParser(action.user);
        return { ...state, ...newUser };
      }
      return state;
    }
    case ActionTypes.UNAUTHENTICATED: {
      return initUser();
    }
  }
  return state;
}

const DEFAULT_FORM_STATE = {
  inProgress: false,
  success: false,
  error: false,
  errorText: '',
};

/**
 * Common helper for forms.
 * Returns a reducer that reacts on request/response/fail of reqActionType and on resetActionType.
 * reqActionType is an action of the form itself, resetActionType is used to reset the form state.
 * @param {string} reqActionType
 * @param {string} resetActionType
 * @return {function}
 */
function formState(reqActionType, resetActionType = '') {
  return (state = DEFAULT_FORM_STATE, action) => {
    switch (action.type) {
      case request(reqActionType): {
        return { ...DEFAULT_FORM_STATE, inProgress: true };
      }
      case response(reqActionType): {
        return { ...DEFAULT_FORM_STATE, success: true };
      }
      case fail(reqActionType): {
        return { ...DEFAULT_FORM_STATE, error: true, errorText: action.payload.err };
      }
      case resetActionType: {
        return { ...DEFAULT_FORM_STATE };
      }
    }
    return state;
  };
}

export const archiveActivityForm = formState(
  ActionTypes.ARCHIVE_ACTIVITY_REQUEST,
  ActionTypes.RESET_ARCHIVE_FORMS,
);
export const archiveRestorationForm = formState(
  ActionTypes.ARCHIVE_RESTORATION_REQUEST,
  ActionTypes.RESET_ARCHIVE_FORMS,
);

export function timelines(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action) && action.payload.timelines) {
    return mergeByIds(state, [action.payload.timelines], { insert: true, update: true });
  }

  return state;
}

export function subscriptions(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return mergeByIds(state, action.payload.subscriptions, { insert: true, update: true });
  }
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I):
    case response(ActionTypes.GET_SINGLE_POST):
    case response(ActionTypes.COMPLETE_POST_COMMENTS):
    case response(ActionTypes.CREATE_POST):
    case response(ActionTypes.SAVE_EDITING_POST): {
      return mergeByIds(state, action.payload.subscriptions);
    }
    case ActionTypes.REALTIME_POST_NEW: {
      return mergeByIds(state, action.subscriptions);
    }
    case ActionTypes.REALTIME_LIKE_NEW:
    case ActionTypes.REALTIME_COMMENT_NEW: {
      const subscriptions = !action.post ? action.subscriptions : action.post.subscriptions;
      return mergeByIds(state, subscriptions);
    }
  }
  return state;
}

export const getUserInfoStatuses = asyncStatesMap(
  ActionTypes.GET_USER_INFO,
  {
    getKey: getKeyBy('username'),
  },
  setOnLocationChange({}),
);

export const updateGroupPictureStatuses = asyncStatesMap(
  ActionTypes.UPDATE_GROUP_PICTURE,
  {
    getKey: getKeyBy('groupName'),
  },
  setOnLocationChange({}),
);

export const updateGroupStatuses = asyncStatesMap(
  ActionTypes.UPDATE_GROUP,
  {},
  setOnLocationChange({}),
);

export function groupCreateForm(state = {}, action) {
  switch (action.type) {
    case request(ActionTypes.CREATE_GROUP): {
      return { ...state, status: 'loading' };
    }
    case response(ActionTypes.CREATE_GROUP): {
      const groupUrl = `/${action.payload.groups.username}`;
      return { ...state, status: 'success', groupUrl };
    }
    case fail(ActionTypes.CREATE_GROUP): {
      return { ...state, status: 'error', errorMessage: (action.payload || {}).err };
    }
    case ActionTypes.RESET_GROUP_CREATE_FORM: {
      return {};
    }
  }
  return state;
}

export function routeLoadingState(state = false, action) {
  if (ActionHelpers.isFeedRequest(action)) {
    return true;
  }
  if (ActionHelpers.isFeedResponse(action) || ActionHelpers.isFeedFail(action)) {
    return false;
  }
  if (
    action.type == request(ActionTypes.GET_SINGLE_POST) ||
    action.type == request(ActionTypes.CALENDAR_YEAR_DAYS) ||
    action.type == request(ActionTypes.CALENDAR_MONTH_DAYS)
  ) {
    return true;
  }
  if (
    action.type == response(ActionTypes.GET_SINGLE_POST) ||
    action.type == fail(ActionTypes.GET_SINGLE_POST) ||
    action.type == response(ActionTypes.CALENDAR_YEAR_DAYS) ||
    action.type == fail(ActionTypes.CALENDAR_YEAR_DAYS) ||
    action.type == response(ActionTypes.CALENDAR_MONTH_DAYS) ||
    action.type == fail(ActionTypes.CALENDAR_MONTH_DAYS)
  ) {
    return false;
  }
  switch (action.type) {
    case ActionTypes.UNAUTHENTICATED: {
      return false;
    }
  }
  return state;
}

export function boxHeader(state = '', action) {
  switch (action.type) {
    case request(ActionTypes.HOME): {
      return 'Home';
    }
    case request(ActionTypes.DISCUSSIONS): {
      return 'My discussions';
    }
    case request(ActionTypes.SAVES): {
      return 'Saved posts';
    }
    case request(ActionTypes.DIRECT): {
      return 'Direct messages';
    }
    case request(ActionTypes.GET_SEARCH): {
      return `Search`;
    }
    case request(ActionTypes.MEMORIES): {
      return `Memories: posts from ${formatDateFromShortString(action.payload.from)} and older`;
    }
    case request(ActionTypes.GET_USER_MEMORIES): {
      return `${action.payload.username} memories: posts from ${formatDateFromShortString(
        action.payload.from,
      )} and older`;
    }
    case request(ActionTypes.GET_BEST_OF): {
      return `Best Of ${CONFIG.siteTitle}`;
    }
    case response(ActionTypes.GET_EVERYTHING): {
      return `Everything On ${CONFIG.siteTitle}`;
    }
    case request(ActionTypes.GET_USER_FEED): {
      return '';
    }
    case request(ActionTypes.GET_SUMMARY):
    case request(ActionTypes.GET_USER_SUMMARY): {
      const period = getSummaryPeriod(action.payload.days);
      return `Best of the ${period}`;
    }
    case request(ActionTypes.GET_SINGLE_POST): {
      return '';
    }
    case LOCATION_CHANGE: {
      return '';
    }
  }
  return state;
}

export function highlightTerms(state = [], action) {
  switch (action.type) {
    case request(ActionTypes.GET_SEARCH): {
      return parseQuery(action.payload.search || '');
    }
  }
  return state;
}

export function singlePostId(state = null, action) {
  if (ActionHelpers.isFeedRequest(action)) {
    return null;
  }
  if (action.type == response(ActionTypes.GET_SINGLE_POST)) {
    return action.payload.posts.id;
  }
  if (action.type == fail(ActionTypes.GET_SINGLE_POST)) {
    return action.request.postId;
  }
  return state;
}

const GROUPS_SIDEBAR_LIST_LENGTH = 4;

function sortRecentGroups(g1, g2) {
  if (g1.isPinned !== g2.isPinned) {
    return g1.isPinned ? -1 : 1;
  }
  return g2.updatedAt - g1.updatedAt;
}

const recentGroupInfo =
  (pinnedIds = []) =>
  (g) => ({
    id: g.id,
    updatedAt: parseInt(g.updatedAt),
    isPinned: pinnedIds.includes(g.id),
  });

function getRecentGroups({ subscribers, frontendPreferences }) {
  const clientPreferences = frontendPreferences || {};
  const pinnedGroups = clientPreferences.pinnedGroups || [];
  const groups = (subscribers || []).filter((i) => i.type == 'group');
  return groups
    .map(recentGroupInfo(pinnedGroups))
    .sort(sortRecentGroups)
    .slice(0, GROUPS_SIDEBAR_LIST_LENGTH + pinnedGroups.length);
}

/**
 * List of the recent groups
 * @param {{id: string, isPinned: boolean, updatedAt: number}[]} state
 * @param {{type: string}} action
 */
export function recentGroups(state = [], action) {
  const updateGroups = (...groups) => {
    const pinnedIds = state.filter((g) => g.isPinned).map((g) => g.id);
    const updGroups = groups.map(recentGroupInfo(pinnedIds));
    return _.uniqBy([...updGroups, ...state], 'id')
      .sort(sortRecentGroups)
      .slice(0, GROUPS_SIDEBAR_LIST_LENGTH + pinnedIds.length);
  };

  switch (action.type) {
    case response(ActionTypes.TOGGLE_PINNED_GROUP): {
      const { subscribers, users } = action.payload;
      const frontendPreferences = users.frontendPreferences[frontendPrefsConfig.clientId];
      return getRecentGroups({ subscribers, frontendPreferences });
    }
    case response(ActionTypes.WHO_AM_I): {
      const { subscribers } = action.payload;
      const frontendPreferences =
        action.payload.users.frontendPreferences[frontendPrefsConfig.clientId];
      return getRecentGroups({ subscribers, frontendPreferences });
    }
    case response(ActionTypes.CREATE_GROUP):
    case response(ActionTypes.UPDATE_GROUP): {
      return updateGroups(action.payload.groups);
    }
    case ActionTypes.REALTIME_USER_UPDATE: {
      if (action.updatedGroups) {
        return updateGroups(...action.updatedGroups);
      }
      return state;
    }
    case ActionTypes.REALTIME_GLOBAL_USER_UPDATE: {
      if (state.some((g) => g.id === action.user.id)) {
        // We don't know here are we subscribed to this group. So updating only
        // if this group is already in the list.
        return updateGroups(action.user);
      }
      return state;
    }
  }

  return state;
}

const initialUserState = {
  initial: true, // will be removed by handleUsers
  payload: [],
  isPending: false,
  errorString: '',
};

const handleUsers = (state, action, type, errorString) => {
  if (action.type == request(type)) {
    return {
      payload: [],
      isPending: true,
      errorString: '',
    };
  }

  if (action.type == response(type)) {
    return {
      payload: (action.payload.subscribers || []).map(userParser),
      isPending: false,
      errorString: '',
    };
  }

  if (action.type == fail(type)) {
    return {
      payload: [],
      isPending: false,
      errorString,
    };
  }

  return state;
};

export function usernameSubscribers(state = initialUserState, action) {
  if (action.type == response(ActionTypes.UNSUBSCRIBE_FROM_GROUP)) {
    const { userName } = action.request;
    return {
      ...state,
      payload: state.payload.filter((user) => user.username !== userName),
    };
  }

  return handleUsers(
    state,
    action,
    ActionTypes.SUBSCRIBERS,
    'error occured while fetching subscribers',
  );
}

const usernameSubscriptionsState = {
  payload: [],
  isPending: false,
  errorString: '',
};

export function usernameSubscriptions(state = usernameSubscriptionsState, action) {
  return handleUsers(
    state,
    action,
    ActionTypes.SUBSCRIPTIONS,
    'error occured while fetching subscriptions',
  );
}

export function usernameBlockedByMe(state = {}, action) {
  return handleUsers(
    state,
    { ...action, payload: { subscribers: action.payload } },
    ActionTypes.BLOCKED_BY_ME,
    'error occured while fetching blocked users',
  );
}

export const blockedByMeStatus = asyncState(
  ActionTypes.BLOCKED_BY_ME,
  setOnLogOut(initialAsyncState),
);

const removeItemFromGroupRequests = (state, action) => {
  const { userName, groupName } = action.request;

  const group = state.find((group) => group.username === groupName);

  if (group && group.requests.length > 0) {
    const newGroup = {
      ...group,
      requests: group.requests.filter((user) => user.username !== userName),
    };

    return [..._.without(state, group), newGroup];
  }

  return state;
};

export function managedGroups(state = [], action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return action.payload.managedGroups.map(userParser).map((group) => {
        group.requests = group.requests.map(userParser);
        return { ...group };
      });
    }
    case response(ActionTypes.ACCEPT_GROUP_REQUEST):
    case response(ActionTypes.REJECT_GROUP_REQUEST): {
      return removeItemFromGroupRequests(state, action);
    }
    case response(ActionTypes.UNADMIN_GROUP_ADMIN): {
      if (action.request.isItMe) {
        return state.filter((group) => group.username !== action.request.groupName);
      }
      return state;
    }
    case ActionTypes.REALTIME_INCOMING_EVENT: {
      if (action.payload.event === 'event:new') {
        const { Notifications, users, groups } = action.payload.data;
        for (const note of Notifications) {
          const user = users.find((u) => u.id === note.created_user_id);
          const group = groups.find((g) => g.id === note.group_id);
          switch (note.event_type) {
            case 'group_subscription_requested': {
              if (!state.find((g) => g.id === group.id).requests.some((u) => u.id === user.id)) {
                const newState = _.cloneDeep(state);
                newState.find((g) => g.id === group.id).requests.push(user);
                return newState;
              }
              return state;
            }
            case 'group_subscription_request_revoked': {
              if (state.find((g) => g.id === group.id).requests.some((u) => u.id === user.id)) {
                return _.cloneDeep(state).map((g) => {
                  if (g.id === group.id) {
                    g.requests = g.requests.filter((u) => u.id !== user.id);
                    return g;
                  }
                  return g;
                });
              }
              return state;
            }
          }
        }
      }
      return state;
    }
    case ActionTypes.UNAUTHENTICATED: {
      return [];
    }
  }

  return state;
}

const findByIds = (collection, ids) => {
  return _.filter(collection, (item) => _.includes(ids, item.id));
};

const subscriptionRequests = (whoamiPayload) => {
  const subscriptionRequestsIds = whoamiPayload.users.subscriptionRequests || [];
  return findByIds(whoamiPayload.requests || [], subscriptionRequestsIds).map(userParser);
};

const pendingSubscriptionRequests = (whoamiPayload) => {
  const pendingSubscriptionRequestsIds = whoamiPayload.users.pendingSubscriptionRequests || [];
  return findByIds(whoamiPayload.requests || [], pendingSubscriptionRequestsIds).map(userParser);
};

export function userRequests(state = [], action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return subscriptionRequests(action.payload);
    }
    case response(ActionTypes.ACCEPT_USER_REQUEST):
    case response(ActionTypes.REJECT_USER_REQUEST): {
      const { username } = action.request;
      return state.filter((user) => user.username !== username);
    }
    case ActionTypes.REALTIME_INCOMING_EVENT: {
      if (action.payload.event === 'event:new') {
        const { Notifications, users } = action.payload.data;
        for (const note of Notifications) {
          const user = users.find((u) => u.id === note.created_user_id);
          if (note.event_type === 'subscription_requested') {
            if (!state.some((u) => u.id === user.id)) {
              return [...state, user];
            }
          } else if (note.event_type === 'subscription_request_revoked') {
            return state.filter((u) => u.id !== user.id);
          }
        }
      }
      return state;
    }
  }

  return state;
}

export function sentRequests(state = [], action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return pendingSubscriptionRequests(action.payload);
    }
    case response(ActionTypes.REVOKE_USER_REQUEST): {
      const { username } = action.request;
      return state.filter((user) => user.username !== username);
    }
    case response(ActionTypes.SEND_SUBSCRIPTION_REQUEST): {
      return [...state, action.payload];
    }
  }

  return state;
}

export function groupRequestsCount(state = 0, action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return action.payload.managedGroups.reduce((acc, group) => {
        return acc + group.requests.length;
      }, 0);
    }
    case response(ActionTypes.ACCEPT_GROUP_REQUEST):
    case response(ActionTypes.REJECT_GROUP_REQUEST): {
      return Math.max(0, state - 1);
    }
  }

  return state;
}

export function userRequestsCount(state = 0, action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return subscriptionRequests(action.payload).length;
    }
    case response(ActionTypes.ACCEPT_USER_REQUEST):
    case response(ActionTypes.REJECT_USER_REQUEST): {
      return Math.max(0, state - 1);
    }
  }
  return state;
}

export function sentRequestsCount(state = 0, action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return pendingSubscriptionRequests(action.payload).length;
    }
    case response(ActionTypes.REVOKE_USER_REQUEST): {
      return Math.max(0, state - 1);
    }
    case response(ActionTypes.SEND_SUBSCRIPTION_REQUEST): {
      return state + 1;
    }
  }

  return state;
}

const initialRealtimeSettings = {
  realtimeActive: false,
  status: '',
  errorMessage: '',
};

export function frontendRealtimePreferencesForm(state = initialRealtimeSettings, action) {
  switch (action.type) {
    case ActionTypes.TOGGLE_REALTIME: {
      return { ...state, realtimeActive: !state.realtimeActive, status: '' };
    }
    case response(ActionTypes.WHO_AM_I): {
      const fp = action.payload.users.frontendPreferences[frontendPrefsConfig.clientId];
      return {
        ...state,
        realtimeActive: fp ? fp.realtimeActive : initialRealtimeSettings.realtimeActive,
      };
    }
  }
  return state;
}

const defaultGroupAdmins = {};
export function groupAdmins(state = defaultGroupAdmins, action) {
  switch (action.type) {
    case LOCATION_CHANGE: {
      // Reset on location change
      return defaultGroupAdmins;
    }
    case response(ActionTypes.GET_USER_INFO): {
      const { users: user, admins = [] } = action.payload;
      if (user.type === 'group') {
        return { ...state, [user.username]: admins.map(userParser) };
      }
      break;
    }
    case response(ActionTypes.MAKE_GROUP_ADMIN): {
      const { groupName, user } = action.request;
      const prevList = state[groupName];
      if (!prevList || prevList.find((u) => u.id === user.id)) {
        break;
      }
      return { ...state, [groupName]: [...prevList, userParser(user)] };
    }
    case response(ActionTypes.UNADMIN_GROUP_ADMIN): {
      const { groupName, user } = action.request;
      const prevList = state[groupName];
      if (!prevList || !prevList.find((u) => u.id === user.id)) {
        break;
      }
      return {
        ...state,
        [groupName]: prevList.filter((u) => u.username !== user.username),
      };
    }
  }

  return state;
}

const userActionsStatusesStatusMaps = combineReducers({
  subscribing: asyncStatesMap(
    [
      ActionTypes.SUBSCRIBE,
      ActionTypes.SEND_SUBSCRIPTION_REQUEST,
      ActionTypes.REVOKE_USER_REQUEST,
      ActionTypes.UNSUBSCRIBE,
    ],
    { getKey: getKeyBy('username') },
  ),
  blocking: asyncStatesMap(
    [
      ActionTypes.BAN,
      ActionTypes.UNBAN,
      ActionTypes.DISABLE_BANS_IN_GROUP,
      ActionTypes.ENABLE_BANS_IN_GROUP,
    ],
    { getKey: getKeyBy('username') },
  ),
  pinned: asyncStatesMap([ActionTypes.TOGGLE_PINNED_GROUP]), // by user id!
  hiding: asyncStatesMap([ActionTypes.HIDE_BY_CRITERION], {
    getKey: getKeyBy(({ criterion: c }) => `${c.type}:${c.value}`),
  }),
  unsubscribingFromMe: asyncStatesMap([ActionTypes.UNSUBSCRIBE_FROM_ME], {
    getKey: getKeyBy('username'),
  }),
  reviewingRequest: asyncStatesMap(
    [ActionTypes.ACCEPT_USER_REQUEST, ActionTypes.REJECT_USER_REQUEST],
    { getKey: getKeyBy('username') },
  ),
  reviewingGroupRequest: asyncStatesMap(
    [ActionTypes.ACCEPT_GROUP_REQUEST, ActionTypes.REJECT_GROUP_REQUEST],
    {
      getKey: keyFromRequestPayload(({ userName, groupName }) => `${userName}:${groupName}`),
    },
  ),
});

const initialUserProfileStatuses = userActionsStatusesStatusMaps(undefined, { type: '' });

function clearStatusesById(state, userId) {
  return _.fromPairs(Object.keys(state).map((key) => [key, _.omit(state[key], userId)]));
}

export function userActionsStatuses(state = initialUserProfileStatuses, action) {
  if (action.type === response(ActionTypes.GET_USER_FEED)) {
    // Reset user statuses if user feed is loaded
    return clearStatusesById(state, action.payload.timelines.user);
  }
  if (action.type === ActionTypes.USER_CARD_CLOSING) {
    // Reset user statuses if user card is closing
    return clearStatusesById(state, action.payload.userId);
  }
  if (action.type === LOCATION_CHANGE) {
    // Reset all statuses if location changes
    return initialUserProfileStatuses;
  }
  return userActionsStatusesStatusMaps(state, action);
}

export function realtimeSubscriptions(state = [], action) {
  switch (action.type) {
    case ActionTypes.REALTIME_SUBSCRIBE: {
      const { rooms } = action.payload;
      const newState = _.union(state, rooms);
      return newState.length !== state.length ? newState : state;
    }
    case ActionTypes.REALTIME_UNSUBSCRIBE: {
      const { rooms } = action.payload;
      const newState = _.difference(state, rooms);
      return newState.length !== state.length ? newState : state;
    }
  }
  return state;
}

export function notifications(state = [], action) {
  switch (action.type) {
    case request(ActionTypes.GET_NOTIFICATIONS): {
      return {
        loading: true,
        error: false,
      };
    }
    case response(ActionTypes.GET_NOTIFICATIONS): {
      return {
        events: action.payload.Notifications,
        error: false,
        loading: false,
      };
    }
    case fail(ActionTypes.GET_NOTIFICATIONS): {
      return {
        events: [],
        error: true,
        loading: false,
      };
    }
  }
  return state;
}

const defaultArchivePostState = {
  ...DEFAULT_FORM_STATE,
  id: null,
};

export function archivePost(state = DEFAULT_FORM_STATE, action) {
  switch (action.type) {
    case request(ActionTypes.GET_POST_ID_BY_OLD_NAME): {
      return { ...defaultArchivePostState, inProgress: true };
    }
    case response(ActionTypes.GET_POST_ID_BY_OLD_NAME): {
      return { ...defaultArchivePostState, success: true, id: action.payload.postId };
    }
    case fail(ActionTypes.GET_POST_ID_BY_OLD_NAME): {
      return { ...defaultArchivePostState, error: true, errorText: action.payload.err };
    }
  }
  return state;
}

export function createInvitationForm(state = DEFAULT_FORM_STATE, action) {
  switch (action.type) {
    case request(ActionTypes.CREATE_FREEFEED_INVITATION): {
      return { ...state, isSaving: true, error: false, success: false };
    }
    case response(ActionTypes.CREATE_FREEFEED_INVITATION): {
      return {
        ...state,
        isSaving: false,
        success: true,
        invitationId: action.payload.invitation.secure_id,
      };
    }
    case fail(ActionTypes.CREATE_FREEFEED_INVITATION): {
      return {
        ...state,
        isSaving: false,
        error: true,
        errorText: action.payload.err || 'Something went wrong',
      };
    }
  }
  return state;
}

export function serverTimeAhead(state = 0, action) {
  if (action.type === ActionTypes.SERVER_TIME_AHEAD) {
    return action.payload;
  }
  return state;
}

const getInitialFeedViewOptions = () => {
  const { homeFeedSort } = frontendPrefsConfig.defaultValues;
  return {
    homeFeedSort,
    sort: homeFeedSort,
    currentFeed: ActionTypes.HOME,
    currentFeedType: 'RiverOfNews',
  };
};

export function feedViewOptions(state = getInitialFeedViewOptions(), action) {
  if (action.type === response(ActionTypes.WHO_AM_I)) {
    const defaultHomeFeedSort = frontendPrefsConfig.defaultValues.homeFeedSort;
    const frontendPreferences =
      action.payload.users.frontendPreferences &&
      action.payload.users.frontendPreferences[frontendPrefsConfig.clientId];
    const homeFeedSort =
      (frontendPreferences && frontendPreferences.homeFeedSort) || defaultHomeFeedSort;
    const sort = state.currentFeed === ActionTypes.HOME ? homeFeedSort : state.sort;
    return { ...state, homeFeedSort, sort };
  }
  if (ActionHelpers.isFeedRequest(action)) {
    let { sort } = state;
    if (state.currentFeed !== ActionHelpers.getFeedName(action)) {
      sort = action.type === request(ActionTypes.HOME) ? state.homeFeedSort : FeedOptions.ACTIVITY;
    }
    return {
      ...state,
      currentFeed: ActionHelpers.getFeedName(action),
      sort,
    };
  }
  if (ActionHelpers.isFeedResponse(action)) {
    const currentFeedType = action.payload.timelines ? action.payload.timelines.name : null;
    return { ...state, currentFeedType };
  }
  if (action.type === ActionTypes.TOGGLE_FEED_SORT) {
    const sort =
      state.sort === FeedOptions.ACTIVITY ? FeedOptions.CHRONOLOGIC : FeedOptions.ACTIVITY;
    return {
      ...state,
      sort,
      homeFeedSort: state.currentFeed === ActionTypes.HOME ? sort : state.homeFeedSort,
    };
  }
  return state;
}

export function systemColorScheme(state = getSystemColorScheme(), action) {
  if (action.type === ActionTypes.SET_SYSTEM_COLOR_SCHEME) {
    return action.payload;
  }
  return state;
}

export function userColorScheme(state = loadColorScheme(), action) {
  if (action.type === ActionTypes.SET_USER_COLOR_SCHEME) {
    return action.payload;
  }
  return state;
}

export function isNSFWVisible(state = loadNSFWVisibility(), action) {
  if (action.type === ActionTypes.SET_NSFW_VISIBILITY) {
    return action.payload;
  }
  return state;
}

export function isOrbitDisabled(state = loadOrbitDisabled(), action) {
  if (action.type === ActionTypes.SET_ORBIT) {
    return action.payload;
  }
  return state;
}

export function uiScale(state = loadUIScale(), action) {
  if (action.type === ActionTypes.SET_UI_SCALE) {
    return action.payload;
  }
  return state;
}

export { settingsForms } from './reducers/settings-forms';
export { appTokens } from './reducers/app-tokens';
export { serverInfo, serverInfoStatus } from './reducers/server-info';
export { extAuth } from './reducers/ext-auth.js';

export function postHideCriteria(state = [], action) {
  if (ActionHelpers.isUserChangeResponse(action)) {
    const fromAction =
      action.payload.users.frontendPreferences[CONFIG.frontendPreferences.clientId]?.homefeed || {};
    const fromConfig = CONFIG.frontendPreferences.defaultValues.homefeed;
    return prefsToCriteria({ ...fromConfig, ...fromAction });
  }
  return state;
}

export const allGroupsStatus = asyncState(
  ActionTypes.GET_ALL_GROUPS,
  setOnLocationChange(initialAsyncState, ['/all-groups']),
);

const allGroupsDefaults = { withProtected: false, groups: [] };
export const allGroups = fromResponse(
  ActionTypes.GET_ALL_GROUPS,
  ({ payload: { withProtected, groups, users } }) => ({
    withProtected,
    groups: groups.map((g) => {
      const user = users.find((u) => u.id === g.id);
      return {
        ...g,
        createdAt: user.createdAt,
        username: user.username,
        screenName: user.screenName,
      };
    }),
  }),
  allGroupsDefaults,
  setOnLocationChange(allGroupsDefaults, ['/all-groups']),
);

export {
  homeFeeds,
  homeFeedsStatus,
  usersInHomeFeeds,
  usersInHomeFeedsStates,
  updateUsersSubscriptionStates,
  allSubscriptions,
  allSubscriptionsStatus,
  crudHomeFeedStatus,
  homeFeedsOrderVersion,
} from './reducers/home-feeds';

export function resumeToken(state = null, action) {
  switch (action.type) {
    case fail(ActionTypes.SIGN_IN):
      return action.payload.resumeToken || null;
    case LOCATION_CHANGE:
    case request(ActionTypes.SIGN_IN):
      return null;
  }

  return state;
}

export { attachmentUploads, attachmentUploadStatuses } from './reducers/attachment-uploads';

export {
  signOutStatus,
  authSessions,
  authSessionsStatus,
  closeAuthSessionsStatus,
} from './reducers/auth-sessios';

export function betaChannel(
  state = CONFIG.betaChannel.enabled && CONFIG.betaChannel.isBeta,
  action,
) {
  if (action.type === ActionTypes.SET_BETA_CHANNEL) {
    return action.payload;
  }
  return state;
}

export function appUpdated(state = { version: null, updated: false }, action) {
  if (action.type === ActionTypes.APP_VERSION) {
    const version = action.payload;
    const updated = state.version !== null && state.version !== version;
    if (state.version === null || updated) {
      return { version, updated };
    }
  }
  return state;
}

export { donationAccount, donationLoadingStatus } from './reducers/donation-status';

export function sidebarOpened(state = false, action) {
  if (action.type === ActionTypes.OPEN_SIDEBAR) {
    return action.payload;
  }
  return state;
}

export function submitMode(state = loadSubmitMode(), action) {
  if (action.type === ActionTypes.SET_SUBMIT_MODE) {
    return action.payload;
  }
  return state;
}

export { bannedUsernames } from './reducers/banned';

export {
  attachmentsStats,
  attachmentsStatsStatus,
  sanitizeMediaStatus,
} from './reducers/my-attachments';

export const getCommentStatuses = asyncStatesMap(ActionTypes.GET_COMMENT_BY_NUMBER, {
  getKey: keyFromRequestPayload((p) => `${p.postId}#${p.seqNumber}`),
  cleanOnSuccess: true,
});

export const groupBlockedUsersStatus = asyncState(
  ActionTypes.GET_GROUP_BLOCKED_USERS,
  setOnLocationChange(initialAsyncState),
);

const groupBlockedUsersDefaults = [];
export function groupBlockedUsers(state = groupBlockedUsersDefaults, action) {
  switch (action.type) {
    case response(ActionTypes.GET_GROUP_BLOCKED_USERS):
    case response(ActionTypes.BLOCK_USER_IN_GROUP):
    case response(ActionTypes.UNBLOCK_USER_IN_GROUP): {
      return action.payload.blockedUsers;
    }
    case LOCATION_CHANGE: {
      return groupBlockedUsersDefaults;
    }
  }
  return state;
}

export const blockUserInGroupStatus = asyncState(
  ActionTypes.BLOCK_USER_IN_GROUP,
  setOnLocationChange(initialAsyncState),
);

export const unblockUserInGroupStatus = asyncState(
  ActionTypes.UNBLOCK_USER_IN_GROUP,
  setOnLocationChange(initialAsyncState),
);

export const sendVerificationCodeStatus = asyncState(
  ActionTypes.SEND_VERIFICATION_CODE,
  setOnLocationChange(initialAsyncState),
);

export const invitationsInfoStatus = asyncState(
  ActionTypes.GET_INVITATIONS_INFO,
  setOnLocationChange(initialAsyncState),
);

export const invitationsInfo = fromResponse(
  ActionTypes.GET_INVITATIONS_INFO,
  (action) => action.payload,
  null,
  setOnLocationChange(initialAsyncState),
);

const invitedByInitial = {};
export function invitedByMap(state = invitedByInitial, action) {
  if (action.type === response(ActionTypes.GET_USER_INFO)) {
    return { ...state, [action.request.username]: action.payload.invitedBy };
  } else if (action.type === LOCATION_CHANGE) {
    return invitedByInitial;
  }
  return state;
}

export function currentRoute(
  state = {
    name: '',
    path: '',
    params: {},
  },
  action,
) {
  if (action.type === ActionTypes.SET_CURRENT_ROUTE) {
    return action.payload;
  }
  return state;
}

export const calendarYearDays = fromResponse(
  ActionTypes.CALENDAR_YEAR_DAYS,
  (action) => action.payload,
  null,
  setOnLocationChange(initialAsyncState),
);

export const calendarMonthDays = fromResponse(
  ActionTypes.CALENDAR_MONTH_DAYS,
  (action) => action.payload,
  null,
  setOnLocationChange(initialAsyncState),
);

export { userStatsStatus, userStats } from './reducers/dynamic-user-stats';

export { translationStates, translationResults } from './reducers/translation';

export { unlockedCommentStates, unlockedComments } from './reducers/unlocked-comments';

export function lastAutocompleteQuery(state = '', action) {
  if (action.type === response(ActionTypes.GET_MATCHED_USERS)) {
    return action.request.query;
  }
  return state;
}
