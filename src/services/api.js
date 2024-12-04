/* global CONFIG */
import { parse as qsParse } from 'querystring';
import * as _ from 'lodash-es';

import { getDateForMemoriesRequest } from '../utils/get-date-from-short-string';
import { userParser } from '../utils';
import { UPDATE_SUBSCRIPTION, SUBSCRIBE, SEND_SUBSCRIPTION_REQUEST } from '../redux/action-types';
import {
  addCriterion,
  criteriaToPrefs,
  prefsToCriteria,
  removeCriteria,
} from '../utils/hide-criteria';
import { getToken } from './auth';
import { popupAsPromise } from './popup';
import { apiVersion } from './api-version';

const apiRoot = CONFIG.api.root;
const frontendPrefsId = CONFIG.frontendPreferences.clientId;

const apiPrefix = `${apiRoot}/v${apiVersion}`;

const getRequestOptions = () => ({
  headers: {
    Accept: 'application/json',
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  },
});

const postRequestOptions = (method = 'POST', body = {}) => ({
  method,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  },
  body: JSON.stringify(body),
});

const feedQueryString = ({ offset, sortChronologically, homeFeedMode, from, tz }) =>
  [
    offset && `offset=${offset}`,
    sortChronologically && `sort=created`,
    homeFeedMode && `homefeed-mode=${encodeURIComponent(homeFeedMode)}`,
    from && `created-before=${getDateForMemoriesRequest(from).toISOString()}`,
    tz && `tz=${tz}`,
  ]
    .filter(Boolean)
    .join('&');

export function getWhoAmI() {
  return fetch(`${apiPrefix}/users/whoami`, getRequestOptions());
}

export function getHome({ feedId, ...params }) {
  return fetch(
    `${apiPrefix}/timelines/home${feedId ? `/${feedId}/posts` : ''}?${feedQueryString(params)}`,
    getRequestOptions(),
  );
}

export function getMemories(params) {
  return fetch(
    `${apiPrefix}/timelines/home?${feedQueryString(params)}&sort=created`,
    getRequestOptions(),
  );
}

export function getDiscussions(params) {
  return fetch(
    `${apiPrefix}/timelines/filter/discussions?with-my-posts=yes&${feedQueryString(params)}`,
    getRequestOptions(),
  );
}

export function getSaves(params) {
  return fetch(
    `${apiPrefix}/timelines/filter/saves?${feedQueryString(params)}`,
    getRequestOptions(),
  );
}

export function getDirect(params) {
  return fetch(
    `${apiPrefix}/timelines/filter/directs?${feedQueryString(params)}`,
    getRequestOptions(),
  );
}

export function getUserFeed({ username, ...params }) {
  return fetch(
    `${apiPrefix}/timelines/${username}?${feedQueryString(params)}`,
    getRequestOptions(),
  );
}

export function getUserStats({ username }) {
  return fetch(`${apiPrefix}/users/${username}/statistics`, getRequestOptions());
}

export function getNotifications({ offset, filter }) {
  return fetch(`${apiPrefix}/notifications?offset=${offset}&filter=${filter}`, getRequestOptions());
}

export function getLikesOnly({ postId, commentsExpanded }) {
  return getPost({
    postId,
    maxComments: commentsExpanded ? 'all' : '',
    maxLikes: 'all',
  });
}

export function getPost({ postId, maxComments = '', maxLikes = '' }) {
  return fetch(
    `${apiPrefix}/posts/${postId}?maxComments=${maxComments}&maxLikes=${maxLikes}`,
    getRequestOptions(),
  );
}

export function getPostIdByOldName({ oldName }) {
  return fetch(
    `${apiPrefix}/archives/post-by-old-name/${encodeURIComponent(oldName)}`,
    getRequestOptions(),
  );
}

export function createPost({ feeds, postText, attachmentIds, more }) {
  return fetch(
    `${apiPrefix}/posts`,
    postRequestOptions('POST', {
      post: {
        body: postText,
        attachments: attachmentIds,
      },
      meta: {
        feeds,
        commentsDisabled: !!more.commentsDisabled,
      },
    }),
  );
}

export function createBookmarkletPost({ feeds, postText, imageUrls, commentText }) {
  return fetch(
    `${apiPrefix}/bookmarklet`,
    postRequestOptions('POST', {
      title: postText,
      images: imageUrls,
      comment: commentText,
      meta: { feeds },
    }),
  );
}

export function updatePost({ postId, newPost }) {
  return fetch(`${apiPrefix}/posts/${postId}`, postRequestOptions('PUT', { post: newPost }));
}

export function deletePost({ postId, fromFeeds = [] }) {
  const sp = new URLSearchParams();
  for (const feed of fromFeeds) {
    sp.append('fromFeed', feed);
  }
  return fetch(`${apiPrefix}/posts/${postId}?${sp.toString()}`, postRequestOptions('DELETE'));
}

export function addComment({ postId, commentText }) {
  return fetch(
    `${apiPrefix}/comments`,
    postRequestOptions('POST', { comment: { body: commentText, postId } }),
  );
}

export function updateComment({ commentId, newCommentBody }) {
  return fetch(
    `${apiPrefix}/comments/${commentId}`,
    postRequestOptions('PUT', { comment: { body: newCommentBody } }),
  );
}

export function likeComment({ commentId }) {
  return fetch(`${apiPrefix}/comments/${commentId}/like`, postRequestOptions());
}

export function unlikeComment({ commentId }) {
  return fetch(`${apiPrefix}/comments/${commentId}/unlike`, postRequestOptions());
}

export function getCommentLikes({ commentId }) {
  return fetch(`${apiPrefix}/comments/${commentId}/likes`, getRequestOptions());
}

export function deleteComment({ commentId }) {
  return fetch(`${apiPrefix}/comments/${commentId}`, postRequestOptions('DELETE'));
}

export function likePost({ postId }) {
  return fetch(`${apiPrefix}/posts/${postId}/like`, postRequestOptions());
}

export function unlikePost({ postId }) {
  return fetch(`${apiPrefix}/posts/${postId}/unlike`, postRequestOptions());
}

export function hidePost({ postId }) {
  return fetch(`${apiPrefix}/posts/${postId}/hide`, postRequestOptions());
}

export function unhidePost({ postId }) {
  return fetch(`${apiPrefix}/posts/${postId}/unhide`, postRequestOptions());
}

export function disableComments({ postId }) {
  return fetch(`${apiPrefix}/posts/${postId}/disableComments`, postRequestOptions());
}

export function enableComments({ postId }) {
  return fetch(`${apiPrefix}/posts/${postId}/enableComments`, postRequestOptions());
}

const encodeBody = (body) =>
  _.map(body, (value, key) => `${key}=${encodeURIComponent(value)}`).join('&');

export function signIn({ username, password }) {
  const encodedBody = encodeBody({ username, password });

  return fetch(`${apiPrefix}/session`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
    body: encodedBody,
  });
}

export function restorePassword({ mail }) {
  const encodedBody = encodeBody({ email: mail });
  return fetch(`${apiPrefix}/passwords`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
    body: encodedBody,
  });
}

export function resetPassword({ password, token }) {
  const params = {
    newPassword: password,
    passwordConfirmation: password,
  };

  const encodedBody = encodeBody(params);
  return fetch(`${apiPrefix}/passwords/${token}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'PUT',
    body: encodedBody,
  });
}

export function signUp(postData) {
  return fetch(`${apiPrefix}/users`, postRequestOptions('POST', postData));
}

export function markAllDirectsAsRead() {
  return fetch(`${apiPrefix}/users/markAllDirectsAsRead`, getRequestOptions());
}

export function markAllNotificationsAsRead() {
  return fetch(`${apiPrefix}/users/markAllNotificationsAsRead`, postRequestOptions());
}

export function updateUser({
  id,
  screenName,
  email,
  emailVerificationCode,
  isPrivate,
  isProtected,
  description,
  frontendPrefs,
  backendPrefs,
}) {
  const user = { screenName, email, isPrivate, isProtected, description };
  if (frontendPrefs) {
    user.frontendPreferences = { [frontendPrefsId]: frontendPrefs };
  }
  if (backendPrefs) {
    user.preferences = backendPrefs;
  }
  return fetch(
    `${apiPrefix}/users/${id}`,
    postRequestOptions('PUT', { user, emailVerificationCode }),
  );
}

export function updateUserPreferences({ userId, frontendPrefs, backendPrefs }) {
  const user = {};
  if (frontendPrefs) {
    user.frontendPreferences = { [frontendPrefsId]: frontendPrefs };
  }
  if (backendPrefs) {
    user.preferences = backendPrefs;
  }
  return fetch(`${apiPrefix}/users/${userId}`, postRequestOptions('PUT', { user }));
}

export function updatePassword({ currentPassword, password, passwordConfirmation }) {
  const encodedBody = encodeBody({ currentPassword, password, passwordConfirmation });

  return fetch(`${apiPrefix}/users/updatePassword`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Authentication-Token': getToken(),
    },
    body: encodedBody,
  });
}

export function updateUserPicture({ picture }) {
  const data = new FormData();
  data.append('file', picture);

  return fetch(`${apiPrefix}/users/updateProfilePicture`, {
    method: 'POST',
    headers: { 'X-Authentication-Token': getToken() },
    body: data,
  });
}

const userAction =
  (action) =>
  ({ username, ...rest }) => {
    return fetch(`${apiPrefix}/users/${username}/${action}`, postRequestOptions('POST', rest));
  };

export const ban = userAction('ban');
export const unban = userAction('unban');
export const subscribe = userAction('subscribe');
export const unsubscribe = userAction('unsubscribe');
export const sendSubscriptionRequest = userAction('sendRequest');
export const unsubscribeFromMe = userAction('unsubscribeFromMe');

export function getUserComments({ username, ...params }) {
  return fetch(
    `${apiPrefix}/timelines/${username}/comments?${feedQueryString(params)}`,
    getRequestOptions(),
  );
}

export function getUserLikes({ username, ...params }) {
  return fetch(
    `${apiPrefix}/timelines/${username}/likes?${feedQueryString(params)}`,
    getRequestOptions(),
  );
}

export function getUserMemories({ username, ...params }) {
  return fetch(
    `${apiPrefix}/timelines/${username}?${feedQueryString(params)}&sort=created`,
    getRequestOptions(),
  );
}

export function getCalendarYearDays({ username, year, ...params }) {
  return fetch(
    `${apiPrefix}/calendar/${username}/${year}?${feedQueryString(params)}`,
    getRequestOptions(),
  );
}
export function getCalendarMonthDays({ username, year, month, ...params }) {
  return fetch(
    `${apiPrefix}/calendar/${username}/${year}/${month}?${feedQueryString(params)}`,
    getRequestOptions(),
  );
}

export function getCalendarDatePosts({ username, year, month, day, ...params }) {
  return fetch(
    `${apiPrefix}/calendar/${username}/${year}/${month}/${day}?${feedQueryString(params)}`,
    getRequestOptions(),
  );
}

export function getSubscribers({ username }) {
  return fetch(`${apiPrefix}/users/${username}/subscribers`, getRequestOptions());
}

export function getSubscriptions({ username }) {
  return fetch(`${apiPrefix}/users/${username}/subscriptions`, getRequestOptions());
}

export function getUserInfo({ username }) {
  return fetch(`${apiPrefix}/users/${username}`, getRequestOptions());
}

export function createGroup(groupSettings) {
  return fetch(`${apiPrefix}/groups`, postRequestOptions('POST', { group: groupSettings }));
}

export function updateGroup({ id, groupSettings }) {
  return fetch(`${apiPrefix}/users/${id}`, postRequestOptions('PUT', { user: groupSettings }));
}

export function updateGroupPicture({ groupName, file }) {
  const data = new FormData();
  data.append('file', file);

  return fetch(`${apiPrefix}/groups/${groupName}/updateProfilePicture`, {
    method: 'POST',
    headers: { 'X-Authentication-Token': getToken() },
    body: data,
  });
}

export function acceptGroupRequest({ groupName, userName }) {
  return fetch(`${apiPrefix}/groups/${groupName}/acceptRequest/${userName}`, postRequestOptions());
}

export function rejectGroupRequest({ groupName, userName }) {
  return fetch(`${apiPrefix}/groups/${groupName}/rejectRequest/${userName}`, postRequestOptions());
}

export function acceptUserRequest({ username }) {
  return fetch(`${apiPrefix}/users/acceptRequest/${username}`, postRequestOptions());
}

export function rejectUserRequest({ username }) {
  return fetch(`${apiPrefix}/users/rejectRequest/${username}`, postRequestOptions());
}

export function unsubscribeFromGroup({ groupName, userName }) {
  return fetch(
    `${apiPrefix}/groups/${groupName}/unsubscribeFromGroup/${userName}`,
    postRequestOptions(),
  );
}

export function makeGroupAdmin({ groupName, user }) {
  return fetch(
    `${apiPrefix}/groups/${groupName}/subscribers/${user.username}/admin`,
    postRequestOptions(),
  );
}

export function unadminGroupAdmin({ groupName, user }) {
  return fetch(
    `${apiPrefix}/groups/${groupName}/subscribers/${user.username}/unadmin`,
    postRequestOptions(),
  );
}

export function revokeSentRequest({ username }) {
  return fetch(`${apiPrefix}/requests/${username}/revoke`, postRequestOptions());
}

export function getBlockedByMe() {
  return fetch(`${apiPrefix}/users/blockedByMe`, getRequestOptions());
}

export function getSummary({ days }) {
  return fetch(`${apiPrefix}/summary/${days}`, getRequestOptions());
}

export function getUserSummary({ username, days }) {
  return fetch(`${apiPrefix}/summary/${username}/${days}`, getRequestOptions());
}

export function getSearch({ search = '', offset = 0 }) {
  return fetch(
    `${apiPrefix}/search?qs=${encodeURIComponent(search)}&offset=${offset}`,
    getRequestOptions(),
  );
}

export function getBestOf({ offset = 0 }) {
  return fetch(`${apiPrefix}/bestof?offset=${offset}`, getRequestOptions());
}

export function getEverything(params) {
  return fetch(`${apiPrefix}/everything?${feedQueryString(params)}`, getRequestOptions());
}

export function archiveRestoreActivity() {
  return fetch(`${apiPrefix}/archives/activities`, postRequestOptions('PUT', { restore: true }));
}

export function archiveStartRestoration(params) {
  return fetch(`${apiPrefix}/archives/restoration`, postRequestOptions('POST', params));
}

export function getInvitationsInfo() {
  return fetch(`${apiPrefix}/invitations/info`, getRequestOptions());
}

export function createFreefeedInvitation(params) {
  return fetch(`${apiPrefix}/invitations`, postRequestOptions('POST', params));
}

export function getInvitation({ invitationId }) {
  return fetch(`${apiPrefix}/invitations/${invitationId}`, getRequestOptions());
}

export function getAppTokens() {
  return fetch(`${apiPrefix}/app-tokens`, getRequestOptions());
}

export function getAppTokensScopes() {
  return fetch(`${apiPrefix}/app-tokens/scopes`, getRequestOptions());
}

export function createAppToken(params) {
  return fetch(`${apiPrefix}/app-tokens`, postRequestOptions('POST', params));
}

export function reissueAppToken(tokenId) {
  return fetch(`${apiPrefix}/app-tokens/${tokenId}/reissue`, postRequestOptions());
}

export function deleteAppToken(tokenId) {
  return fetch(`${apiPrefix}/app-tokens/${tokenId}`, postRequestOptions('DELETE'));
}

export function updateAppToken({ tokenId, ...params }) {
  return fetch(`${apiPrefix}/app-tokens/${tokenId}`, postRequestOptions('PUT', params));
}

export function savePost({ postId }) {
  return fetch(`${apiPrefix}/posts/${postId}/save`, postRequestOptions());
}

export function unsavePost({ postId }) {
  return fetch(`${apiPrefix}/posts/${postId}/save`, postRequestOptions('DELETE'));
}

export function getServerInfo() {
  return fetch(`${apiPrefix}/server-info`, getRequestOptions());
}

export function getExtAuthProfiles() {
  return fetch(`${apiPrefix}/ext-auth/profiles`, getRequestOptions());
}

export function unlinkExternalProfile({ id }) {
  return fetch(`${apiPrefix}/ext-auth/profiles/${id}`, postRequestOptions('DELETE'));
}

export async function performExtAuth({ provider, popup, mode }) {
  const [{ search }] = await Promise.all([
    popupAsPromise(popup),
    (async () => {
      const startResp = await fetch(
        `${apiPrefix}/ext-auth/auth-start`,
        postRequestOptions('POST', {
          provider,
          mode,
          redirectURL: `${location.origin}/auth-return.html`,
        }),
      ).then((r) => r.json());

      if (startResp.err) {
        popup.closed || popup.close();
        throw new Error(startResp.err);
      }

      if (!popup.closed) {
        popup.location = startResp.redirectTo;
      }
    })(),
  ]);

  const query = qsParse(search.slice(1));

  const finishResp = await fetch(
    `${apiPrefix}/ext-auth/auth-finish`,
    postRequestOptions('POST', { provider, query }),
  ).then((r) => r.json());

  if (finishResp.err) {
    throw new Error(finishResp.err);
  }

  return finishResp;
}

export function hidePostsByCriterion({ criterion, doHide }) {
  return updateActualPreferences({
    updateFrontendPrefs(prefs) {
      let criteria = prefsToCriteria(prefs.homefeed);
      if (doHide) {
        criteria = addCriterion(criteria, criterion);
      } else {
        criteria = removeCriteria(criteria, criterion);
      }
      return {
        ...prefs,
        homefeed: {
          ...prefs.homefeed,
          ...criteriaToPrefs(criteria),
        },
      };
    },
  });
}

export function unhidePostsByCriteria({ criteria: toRemove }) {
  return updateActualPreferences({
    updateFrontendPrefs(prefs) {
      let criteria = prefsToCriteria(prefs.homefeed);
      criteria = removeCriteria(criteria, toRemove);
      return {
        ...prefs,
        homefeed: {
          ...prefs.homefeed,
          ...criteriaToPrefs(criteria),
        },
      };
    },
  });
}

export function getAllGroups() {
  return fetch(`${apiPrefix}/allGroups`, getRequestOptions());
}

export async function updateActualPreferences({
  updateFrontendPrefs = () => null,
  updateBackendPrefs = () => null,
}) {
  // Actualizing user's prefs
  const whoAmIResp = await getWhoAmI();
  if (whoAmIResp.status !== 200) {
    return whoAmIResp;
  }

  const user = userParser((await whoAmIResp.json()).users);

  const partialFrontendPrefs = updateFrontendPrefs(user.frontendPreferences, user);
  const partialBackendPrefs = updateBackendPrefs(user.preferences, user);

  if (!partialFrontendPrefs && !partialBackendPrefs) {
    // Nothing to do
    return whoAmIResp;
  }

  return await updateUserPreferences({
    userId: user.id,
    frontendPrefs: partialFrontendPrefs && { ...user.frontendPreferences, ...partialFrontendPrefs },
    backendPrefs: partialBackendPrefs,
  });
}

export async function togglePinnedGroup({ id: groupId }) {
  const whoAmIResp = await getWhoAmI();
  if (whoAmIResp.status !== 200) {
    return whoAmIResp;
  }

  const whoAmIData = await whoAmIResp.json();
  const { id: userId, frontendPreferences: frontendPrefs } = userParser(whoAmIData.users);

  const pinnedGroups = frontendPrefs.pinnedGroups || [];
  const p = pinnedGroups.indexOf(groupId);
  if (p === -1) {
    pinnedGroups.push(groupId);
  } else {
    pinnedGroups.splice(p, 1);
  }

  return await updateUserPreferences({ userId, frontendPrefs: { ...frontendPrefs, pinnedGroups } });
}

export function listHomeFeeds() {
  return fetch(`${apiPrefix}/timelines/home/list`, getRequestOptions());
}

export function createHomeFeed({ title, subscribedTo = [] }) {
  return fetch(`${apiPrefix}/timelines/home`, postRequestOptions('POST', { title, subscribedTo }));
}

export function updateHomeFeed({ feedId, title, subscribedTo }) {
  return fetch(
    `${apiPrefix}/timelines/home/${feedId}`,
    postRequestOptions('PATCH', { title, subscribedTo }),
  );
}

export function deleteHomeFeed({ feedId }) {
  return fetch(`${apiPrefix}/timelines/home/${feedId}`, postRequestOptions('DELETE'));
}

export async function subscribeWithHomeFeeds({
  type = UPDATE_SUBSCRIPTION,
  id,
  username,
  homeFeeds,
}) {
  if (type === SEND_SUBSCRIPTION_REQUEST) {
    return sendSubscriptionRequest({ id, username, homeFeeds });
  } else if (type === SUBSCRIBE) {
    return subscribe({ id, username, homeFeeds });
  }

  return fetch(
    `${apiPrefix}/users/${username}/subscribe`,
    postRequestOptions('PUT', { homeFeeds }),
  );
}

export function getAllSubscriptions() {
  return fetch(`${apiPrefix}/timelines/home/subscriptions`, getRequestOptions());
}

export function reorderHomeFeeds({ feedIds }) {
  return fetch(`${apiPrefix}/timelines/home`, postRequestOptions('PATCH', { reorder: feedIds }));
}

export function suspendMe({ password }) {
  return fetch(`${apiPrefix}/users/suspend-me`, postRequestOptions('POST', { password }));
}

export function resumeMe({ resumeToken }) {
  return fetch(`${apiPrefix}/users/resume-me`, postRequestOptions('POST', { resumeToken }));
}

export function createAttachment({ file, name }, { onProgress = () => null } = {}) {
  const formData = new FormData();
  formData.append('file', file, name);
  return new Promise((resolve, reject) => {
    // Use XHR here to control the upload progress
    const req = new XMLHttpRequest();

    req.onload = () => {
      if (req.status === 200) {
        resolve(req.response);
      } else {
        reject(req.response || { err: `HTTP error ${req.status}` });
      }
    };
    req.onerror = () => reject({ err: 'Network error' });
    req.upload.onprogress = (e) => onProgress(e.loaded / e.total);

    req.open('POST', `${apiPrefix}/attachments`);
    req.responseType = 'json';
    req.setRequestHeader('Accept', 'application/json');
    getToken() && req.setRequestHeader('Authorization', `Bearer ${getToken()}`);

    req.send(formData);
  });
}

export function signOut() {
  return fetch(`${apiPrefix}/session`, postRequestOptions('DELETE'));
}

export function reissueAuthSession() {
  return fetch(`${apiPrefix}/session/reissue`, postRequestOptions('POST'));
}

export function listAuthSessions() {
  return fetch(`${apiPrefix}/session/list`, getRequestOptions());
}

export function closeAuthSessions(ids) {
  return fetch(`${apiPrefix}/session/list`, postRequestOptions('PATCH', { close: ids }));
}

export function leaveDirect(postId) {
  return fetch(`${apiPrefix}/posts/${postId}/leave`, postRequestOptions());
}

export function getAttachmentsStats() {
  return fetch(`${apiPrefix}/attachments/my/stats`, getRequestOptions());
}

export function sanitizeMedia() {
  return fetch(`${apiPrefix}/attachments/my/sanitize`, postRequestOptions());
}

export function getCommentByNumber({ postId, seqNumber }) {
  return fetch(`${apiPrefix}/posts/${postId}/comments/${seqNumber}`, getRequestOptions());
}

export function getGroupBlockedUsers({ groupName }) {
  return fetch(`${apiPrefix}/groups/${groupName}/blockedUsers`, getRequestOptions());
}

export function blockUserInGroup({ groupName, username }) {
  return fetch(`${apiPrefix}/groups/${groupName}/block/${username}`, postRequestOptions());
}

export function unblockUserInGroup({ groupName, username }) {
  return fetch(`${apiPrefix}/groups/${groupName}/unblock/${username}`, postRequestOptions());
}

export function sendVerificationCode({ email, mode }) {
  return fetch(`${apiPrefix}/users/verifyEmail`, postRequestOptions('POST', { email, mode }));
}

export function disableBansInGroup({ groupName }) {
  return fetch(`${apiPrefix}/groups/${groupName}/disableBans`, postRequestOptions());
}

export function enableBansInGroup({ groupName }) {
  return fetch(`${apiPrefix}/groups/${groupName}/enableBans`, postRequestOptions());
}

export function getPostsByIds({ postIds }) {
  return fetch(`${apiPrefix}/posts/byIds`, postRequestOptions('POST', { postIds }));
}

export function getCommentsByIds({ commentIds }) {
  return fetch(`${apiPrefix}/comments/byIds`, postRequestOptions('POST', { commentIds }));
}

export function unlockComment({ id }) {
  return fetch(`${apiPrefix}/comments/${id}?unlock-banned`, getRequestOptions());
}

export function translateText({ type, id, lang }) {
  const part = type === 'post' ? 'posts' : 'comments';
  const qs = lang ? `?lang=${lang}` : '';
  return fetch(`${apiPrefix}/${part}/${id}/translated-body${qs}`, getRequestOptions());
}

export function getBacklinks({ postId, offset = 0 }) {
  return fetch(`${apiPrefix}/posts/${postId}/backlinks?offset=${offset}`, getRequestOptions());
}

export function notifyOfAllComments({ postId, enabled }) {
  return fetch(
    `${apiPrefix}/posts/${postId}/notifyOfAllComments`,
    postRequestOptions('POST', { enabled }),
  );
}

export function getMatchedUsers({ query }, fetchOptions = {}) {
  return fetch(`${apiPrefix}/users/sparseMatches?qs=${encodeURIComponent(query)}`, {
    ...getRequestOptions(),
    ...fetchOptions,
  });
}
