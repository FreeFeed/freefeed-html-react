import * as Api from '../services/api';
import * as ActionTypes from './action-types';
import { reset } from './action-helpers';
import { fail, response } from './async-helpers';

export function unauthenticated(payload) {
  return {
    type: ActionTypes.UNAUTHENTICATED,
    payload: { ...payload, authToken: '' },
  };
}

export function staticPage(title) {
  return {
    type: ActionTypes.STATIC_PAGE,
    payload: { title },
  };
}

export function requireAuthentication() {
  return { type: ActionTypes.REQUIRE_AUTHENTICATION };
}

export function whoAmI() {
  return {
    type: ActionTypes.WHO_AM_I,
    apiRequest: Api.getWhoAmI,
  };
}

export function initialWhoAmI() {
  return {
    type: ActionTypes.INITIAL_WHO_AM_I,
    apiRequest: Api.getWhoAmI,
    // This action fires before the full authentication is complete, so
    // technically it should be non-authenticated request
    nonAuthRequest: true,
  };
}

export function markAllDirectsAsRead() {
  return {
    type: ActionTypes.DIRECTS_ALL_READ,
    apiRequest: Api.markAllDirectsAsRead,
  };
}

export function markAllNotificationsAsRead() {
  return {
    type: ActionTypes.NOTIFICATIONS_ALL_READ,
    apiRequest: Api.markAllNotificationsAsRead,
  };
}

export function home(offset = 0) {
  return {
    type: ActionTypes.HOME,
    apiRequest: Api.getHome,
    payload: { offset },
  };
}

export function homeAux(offset = 0, feedId = null) {
  return {
    type: ActionTypes.HOME_AUX,
    apiRequest: Api.getHome,
    payload: { offset, feedId },
  };
}

export function getMemories(_from, offset = 0) {
  return {
    type: ActionTypes.MEMORIES,
    apiRequest: Api.getMemories,
    payload: {
      from: _from,
      offset,
    },
  };
}

export function getCalendarYearDays(username, year) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return {
    type: ActionTypes.CALENDAR_YEAR_DAYS,
    apiRequest: Api.getCalendarYearDays,
    payload: {
      username,
      year,
      tz,
    },
  };
}

export function getCalendarMonthDays(username, year, month) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return {
    type: ActionTypes.CALENDAR_MONTH_DAYS,
    apiRequest: Api.getCalendarMonthDays,
    payload: {
      username,
      year,
      month,
      tz,
    },
  };
}

export function getCalendarDatePosts(username, year, month, day, offset = 0) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return {
    type: ActionTypes.CALENDAR_DATE_POSTS,
    apiRequest: Api.getCalendarDatePosts,
    payload: {
      username,
      year,
      month,
      day,
      offset,
      tz,
    },
  };
}

export function discussions(offset = 0) {
  return {
    type: ActionTypes.DISCUSSIONS,
    apiRequest: Api.getDiscussions,
    payload: { offset },
  };
}

export function saves(offset = 0) {
  return {
    type: ActionTypes.SAVES,
    apiRequest: Api.getSaves,
    payload: { offset },
  };
}

export function direct(offset = 0) {
  return {
    type: ActionTypes.DIRECT,
    apiRequest: Api.getDirect,
    payload: { offset },
  };
}

export function getUserFeed(username, offset = 0) {
  return {
    type: ActionTypes.GET_USER_FEED,
    apiRequest: Api.getUserFeed,
    nonAuthRequest: true,
    payload: { username, offset },
  };
}

export function getUserStats(username) {
  return {
    type: ActionTypes.GET_USER_STATS,
    apiRequest: Api.getUserStats,
    nonAuthRequest: true,
    payload: { username },
  };
}

export function getNotifications(offset = 0, filter = '') {
  return {
    type: ActionTypes.GET_NOTIFICATIONS,
    apiRequest: Api.getNotifications,
    payload: {
      offset,
      filter,
    },
  };
}

export function showMoreComments(postId) {
  return {
    type: ActionTypes.SHOW_MORE_COMMENTS,
    apiRequest: Api.getPost,
    nonAuthRequest: true,
    payload: { postId, maxComments: 'all' },
  };
}

export function completePostComments(postId) {
  return {
    type: ActionTypes.COMPLETE_POST_COMMENTS,
    apiRequest: Api.getPost,
    nonAuthRequest: true,
    payload: { postId },
  };
}

export function showMoreLikes(postId) {
  return {
    type: ActionTypes.SHOW_MORE_LIKES,
    payload: { postId },
  };
}

export function showMoreLikesAsync(postId) {
  return {
    type: ActionTypes.SHOW_MORE_LIKES_ASYNC,
    apiRequest: Api.getLikesOnly,
    nonAuthRequest: true,
    payload: { postId },
  };
}

export function showMoreLikesSync(postId) {
  return {
    type: ActionTypes.SHOW_MORE_LIKES_SYNC,
    payload: { postId },
  };
}

export function toggleEditingPost(postId) {
  return {
    type: ActionTypes.TOGGLE_EDITING_POST,
    payload: { postId },
  };
}

export function cancelEditingPost(postId) {
  return {
    type: ActionTypes.CANCEL_EDITING_POST,
    payload: { postId },
  };
}

export function saveEditingPost(postId, newPost) {
  return {
    type: ActionTypes.SAVE_EDITING_POST,
    apiRequest: Api.updatePost,
    payload: { postId, newPost },
  };
}

export function deletePost(postId, fromFeeds = []) {
  return {
    type: ActionTypes.DELETE_POST,
    apiRequest: Api.deletePost,
    payload: { postId, fromFeeds },
  };
}

export function toggleCommenting(postId, newCommentText = '') {
  return {
    type: ActionTypes.TOGGLE_COMMENTING,
    payload: { postId, newCommentText },
  };
}

export function addComment(postId, commentText, draftKey) {
  return {
    type: ActionTypes.ADD_COMMENT,
    apiRequest: Api.addComment,
    payload: { postId, commentText, draftKey },
  };
}

export function likePost(postId, userId) {
  return {
    type: ActionTypes.LIKE_POST_OPTIMISTIC,
    payload: {
      postId,
      userId,
    },
  };
}

export function likePostRequest(postId, userId) {
  return {
    type: ActionTypes.LIKE_POST,
    apiRequest: Api.likePost,
    payload: {
      postId,
      userId,
    },
  };
}

export function unlikePost(postId, userId) {
  return {
    type: ActionTypes.UNLIKE_POST_OPTIMISTIC,
    payload: {
      postId,
      userId,
    },
  };
}

export function unlikePostRequest(postId, userId) {
  return {
    type: ActionTypes.UNLIKE_POST,
    apiRequest: Api.unlikePost,
    payload: {
      postId,
      userId,
    },
  };
}

export function cleanLikeError(postId) {
  return {
    type: ActionTypes.CLEAN_LIKE_ERROR,
    postId,
  };
}

export function hidePost(postId) {
  return {
    type: ActionTypes.HIDE_POST,
    apiRequest: Api.hidePost,
    payload: { postId },
  };
}

export function unhidePost(postId) {
  return {
    type: ActionTypes.UNHIDE_POST,
    apiRequest: Api.unhidePost,
    payload: { postId },
  };
}

export function savePost(postId, save) {
  return {
    type: ActionTypes.SAVE_POST,
    apiRequest: save ? Api.savePost : Api.unsavePost,
    payload: { postId, save },
  };
}

export function toggleModeratingComments(postId) {
  return {
    type: ActionTypes.TOGGLE_MODERATING_COMMENTS,
    postId,
  };
}

export function disableComments(postId) {
  return {
    type: ActionTypes.DISABLE_COMMENTS,
    apiRequest: Api.disableComments,
    payload: { postId },
  };
}

export function enableComments(postId) {
  return {
    type: ActionTypes.ENABLE_COMMENTS,
    apiRequest: Api.enableComments,
    payload: { postId },
  };
}

export function toggleEditingComment(commentId) {
  return {
    type: ActionTypes.TOGGLE_EDITING_COMMENT,
    commentId,
  };
}

export function saveEditingComment(commentId, newCommentBody, draftKey) {
  return {
    type: ActionTypes.SAVE_EDITING_COMMENT,
    apiRequest: Api.updateComment,
    payload: { commentId, newCommentBody, draftKey },
  };
}

export function likeComment(commentId) {
  return {
    type: ActionTypes.LIKE_COMMENT,
    apiRequest: Api.likeComment,
    payload: { commentId },
  };
}

export function unlikeComment(commentId) {
  return {
    type: ActionTypes.UNLIKE_COMMENT,
    apiRequest: Api.unlikeComment,
    payload: { commentId },
  };
}

export function getCommentLikes(commentId) {
  return {
    type: ActionTypes.GET_COMMENT_LIKES,
    apiRequest: Api.getCommentLikes,
    nonAuthRequest: true,
    payload: { commentId },
  };
}

export function deleteComment(commentId, postId) {
  return {
    type: ActionTypes.DELETE_COMMENT,
    apiRequest: Api.deleteComment,
    payload: { commentId, postId },
  };
}

export function createPost(feeds, postText, attachmentIds, more) {
  return {
    type: ActionTypes.CREATE_POST,
    apiRequest: Api.createPost,
    payload: { feeds, postText, attachmentIds, more },
  };
}

export function createBookmarkletPost(feeds, postText, imageUrls, commentText) {
  return {
    type: ActionTypes.CREATE_POST,
    apiRequest: Api.createBookmarkletPost,
    payload: { feeds, postText, imageUrls, commentText },
  };
}

export function addAttachmentResponse(postId, attachments) {
  return {
    type: ActionTypes.ADD_ATTACHMENT_RESPONSE,
    payload: { postId, attachments },
  };
}

export function signIn(username, password) {
  return {
    type: ActionTypes.SIGN_IN,
    apiRequest: Api.signIn,
    nonAuthRequest: true,
    payload: {
      username,
      password,
    },
  };
}

/**
 * Emulate successful sign in response
 *
 * @param {string} authToken
 */
export function signedIn(authToken) {
  return {
    type: response(ActionTypes.SIGN_IN),
    payload: { authToken },
  };
}

export function restorePassword(mail) {
  return {
    type: ActionTypes.RESTORE_PASSWORD,
    apiRequest: Api.restorePassword,
    nonAuthRequest: true,
    payload: { mail },
  };
}

export function resetPassword(password, token) {
  return {
    type: ActionTypes.RESET_PASSWORD,
    apiRequest: Api.resetPassword,
    nonAuthRequest: true,
    payload: {
      password,
      token,
    },
  };
}

export function resetPasswordValidationFail(error) {
  return {
    type: ActionTypes.RESET_PASSWORD_VALIDATION_FAIL,
    error,
  };
}

export function signUp(signUpData) {
  return {
    type: ActionTypes.SIGN_UP,
    apiRequest: Api.signUp,
    nonAuthRequest: true,
    payload: { ...signUpData },
  };
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
  return {
    type: ActionTypes.UPDATE_USER,
    apiRequest: Api.updateUser,
    payload: {
      id,
      screenName,
      email,
      emailVerificationCode,
      isPrivate,
      isProtected,
      description,
      frontendPrefs,
      backendPrefs,
    },
  };
}

export function updateUserPreferences(
  userId,
  frontendPrefs = {},
  backendPrefs = {},
  suppressStatus = false,
) {
  return {
    type: ActionTypes.UPDATE_USER_PREFERENCES,
    apiRequest: Api.updateUserPreferences,
    payload: { userId, frontendPrefs, backendPrefs },
    extra: { suppressStatus },
  };
}

export function updateActualUserPreferences({
  updateFrontendPrefs = () => null,
  updateBackendPrefs = () => null,
}) {
  return {
    type: ActionTypes.UPDATE_ACTUAL_USER_PREFERENCES,
    apiRequest: Api.updateActualPreferences,
    payload: { updateFrontendPrefs, updateBackendPrefs },
  };
}

export function updateUserNotificationPreferences(userId, backendPrefs) {
  return {
    type: ActionTypes.UPDATE_USER_NOTIFICATION_PREFERENCES,
    apiRequest: Api.updateUserPreferences,
    payload: { userId, backendPrefs },
  };
}

export function updatePassword(payload) {
  return {
    type: ActionTypes.UPDATE_PASSWORD,
    apiRequest: Api.updatePassword,
    payload,
  };
}

export function updateUserPicture(picture) {
  return {
    type: ActionTypes.UPDATE_USER_PICTURE,
    apiRequest: Api.updateUserPicture,
    payload: { picture },
  };
}

export function getSinglePost(postId) {
  return {
    type: ActionTypes.GET_SINGLE_POST,
    apiRequest: Api.getPost,
    nonAuthRequest: true,
    payload: { postId, maxComments: 'all' },
  };
}

export function getPostIdByOldName(oldName) {
  return {
    type: ActionTypes.GET_POST_ID_BY_OLD_NAME,
    apiRequest: Api.getPostIdByOldName,
    nonAuthRequest: true,
    payload: { oldName },
  };
}

const userChangeAction = (type, apiRequest) => (payload) => {
  return {
    type,
    apiRequest,
    payload,
  };
};

export const ban = userChangeAction(ActionTypes.BAN, Api.ban);
export const unban = userChangeAction(ActionTypes.UNBAN, Api.unban);
export const subscribe = userChangeAction(ActionTypes.SUBSCRIBE, Api.subscribe);
export const unsubscribe = userChangeAction(ActionTypes.UNSUBSCRIBE, Api.unsubscribe);
export const unsubscribeFromMe = userChangeAction(
  ActionTypes.UNSUBSCRIBE_FROM_ME,
  Api.unsubscribeFromMe,
);
export const sendSubscriptionRequest = userChangeAction(
  ActionTypes.SEND_SUBSCRIPTION_REQUEST,
  Api.sendSubscriptionRequest,
);

export function getUserComments(username, offset = 0) {
  return {
    type: ActionTypes.GET_USER_COMMENTS,
    apiRequest: Api.getUserComments,
    nonAuthRequest: true,
    payload: { username, offset },
  };
}

export function getUserLikes(username, offset = 0) {
  return {
    type: ActionTypes.GET_USER_LIKES,
    apiRequest: Api.getUserLikes,
    nonAuthRequest: true,
    payload: { username, offset },
  };
}

export function getUserMemories(username, from, offset = 0) {
  return {
    type: ActionTypes.GET_USER_MEMORIES,
    apiRequest: Api.getUserMemories,
    nonAuthRequest: true,
    payload: { username, from, offset },
  };
}

export function toggleHiddenPosts() {
  return { type: ActionTypes.TOGGLE_HIDDEN_POSTS };
}

export function subscribers(username) {
  return {
    type: ActionTypes.SUBSCRIBERS,
    apiRequest: Api.getSubscribers,
    payload: { username },
  };
}

export function subscriptions(username) {
  return {
    type: ActionTypes.SUBSCRIPTIONS,
    apiRequest: Api.getSubscriptions,
    payload: { username },
  };
}

export function getUserInfo(username, extra = {}) {
  return {
    type: ActionTypes.GET_USER_INFO,
    apiRequest: Api.getUserInfo,
    nonAuthRequest: true,
    payload: { username },
    extra,
  };
}

export function createGroup(groupSettings) {
  return {
    type: ActionTypes.CREATE_GROUP,
    payload: groupSettings,
    apiRequest: Api.createGroup,
  };
}

export function updateGroup(id, groupSettings) {
  return {
    type: ActionTypes.UPDATE_GROUP,
    payload: { id, groupSettings },
    apiRequest: Api.updateGroup,
  };
}

export function updateGroupPicture(groupName, file) {
  return {
    type: ActionTypes.UPDATE_GROUP_PICTURE,
    payload: { groupName, file },
    apiRequest: Api.updateGroupPicture,
  };
}

export function acceptGroupRequest(groupName, userName) {
  return {
    type: ActionTypes.ACCEPT_GROUP_REQUEST,
    payload: { groupName, userName },
    apiRequest: Api.acceptGroupRequest,
  };
}

export function rejectGroupRequest(groupName, userName) {
  return {
    type: ActionTypes.REJECT_GROUP_REQUEST,
    payload: { groupName, userName },
    apiRequest: Api.rejectGroupRequest,
  };
}

export function togglePinnedGroup(id) {
  return {
    type: ActionTypes.TOGGLE_PINNED_GROUP,
    apiRequest: Api.togglePinnedGroup,
    payload: { id },
  };
}

export function acceptUserRequest(username) {
  return {
    type: ActionTypes.ACCEPT_USER_REQUEST,
    payload: { username },
    apiRequest: Api.acceptUserRequest,
  };
}

export function rejectUserRequest(username) {
  return {
    type: ActionTypes.REJECT_USER_REQUEST,
    payload: { username },
    apiRequest: Api.rejectUserRequest,
  };
}

export function resetPostCreateForm() {
  return { type: reset(ActionTypes.CREATE_POST) };
}

export function resetGroupCreateForm() {
  return { type: ActionTypes.RESET_GROUP_CREATE_FORM };
}

export function resetGroupUpdateForm() {
  return { type: ActionTypes.RESET_GROUP_UPDATE_FORM };
}

export function toggleRealtime() {
  return { type: ActionTypes.TOGGLE_REALTIME };
}

export function unsubscribeFromGroup(groupName, userName) {
  return {
    type: ActionTypes.UNSUBSCRIBE_FROM_GROUP,
    payload: { groupName, userName },
    apiRequest: Api.unsubscribeFromGroup,
  };
}

export function makeGroupAdmin(groupName, user) {
  return {
    type: ActionTypes.MAKE_GROUP_ADMIN,
    payload: { groupName, user },
    apiRequest: Api.makeGroupAdmin,
  };
}

export function unadminGroupAdmin(groupName, user, isItMe) {
  return {
    type: ActionTypes.UNADMIN_GROUP_ADMIN,
    payload: { groupName, user, isItMe },
    apiRequest: Api.unadminGroupAdmin,
  };
}

export function revokeSentRequest(user) {
  return {
    type: ActionTypes.REVOKE_USER_REQUEST,
    payload: user,
    apiRequest: Api.revokeSentRequest,
  };
}

export function archiveRestoreActivity() {
  return {
    type: ActionTypes.ARCHIVE_ACTIVITY_REQUEST,
    apiRequest: Api.archiveRestoreActivity,
  };
}

export function archiveStartRestoration(params) {
  return {
    type: ActionTypes.ARCHIVE_RESTORATION_REQUEST,
    apiRequest: Api.archiveStartRestoration,
    payload: params,
  };
}

export function blockedByMe() {
  return {
    type: ActionTypes.BLOCKED_BY_ME,
    apiRequest: Api.getBlockedByMe,
  };
}

export function getSummary(days = 7) {
  return {
    type: ActionTypes.GET_SUMMARY,
    apiRequest: Api.getSummary,
    payload: { days },
  };
}

export function getUserSummary(username, days = 7) {
  return {
    type: ActionTypes.GET_USER_SUMMARY,
    apiRequest: Api.getUserSummary,
    nonAuthRequest: true,
    payload: { username, days },
  };
}

export function getSearch(search, offset) {
  return {
    type: ActionTypes.GET_SEARCH,
    apiRequest: Api.getSearch,
    payload: { search, offset },
  };
}

export function getBestOf(offset) {
  return {
    type: ActionTypes.GET_BEST_OF,
    apiRequest: Api.getBestOf,
    payload: { offset },
  };
}

export function getEverything(offset) {
  return {
    type: ActionTypes.GET_EVERYTHING,
    apiRequest: Api.getEverything,
    payload: { offset },
  };
}

export function resetSettingsForms() {
  return { type: ActionTypes.RESET_SETTINGS_FORMS };
}

export function resetArchiveForms() {
  return { type: ActionTypes.RESET_ARCHIVE_FORMS };
}

export function realtimeConnected() {
  return { type: ActionTypes.REALTIME_CONNECTED };
}

export function realtimeSubscribe(...rooms) {
  return {
    type: ActionTypes.REALTIME_SUBSCRIBE,
    payload: { rooms },
  };
}

export function realtimeUnsubscribe(...rooms) {
  return {
    type: ActionTypes.REALTIME_UNSUBSCRIBE,
    payload: { rooms },
  };
}

export function realtimeIncomingEvent(event, data) {
  return {
    type: ActionTypes.REALTIME_INCOMING_EVENT,
    payload: { event, data },
  };
}

export function sendInvite(groupId) {
  return {
    type: ActionTypes.SEND_INVITE,
    groupId,
  };
}

export function createFreefeedInvitation(message, lang, singleUse, users, groups) {
  return {
    type: ActionTypes.CREATE_FREEFEED_INVITATION,
    apiRequest: Api.createFreefeedInvitation,
    payload: {
      message,
      lang,
      singleUse,
      users,
      groups,
    },
  };
}

export function getInvitation(invitationId) {
  return {
    type: ActionTypes.GET_INVITATION,
    apiRequest: Api.getInvitation,
    nonAuthRequest: true,
    payload: { invitationId },
  };
}

export function serverTimeAhead(delta) {
  return {
    type: ActionTypes.SERVER_TIME_AHEAD,
    payload: delta,
  };
}

export function toggleFeedSort() {
  return { type: ActionTypes.TOGGLE_FEED_SORT };
}

/**
 * @param {'dark'|'light'|'no-preference'} scheme
 */
export function setSystemColorScheme(scheme) {
  return { type: ActionTypes.SET_SYSTEM_COLOR_SCHEME, payload: scheme };
}

/**
 * @param {'dark'|'light'|'system'} scheme
 */
export function setUserColorScheme(scheme) {
  return { type: ActionTypes.SET_USER_COLOR_SCHEME, payload: scheme };
}

export function setNSFWVisibility(visible) {
  return { type: ActionTypes.SET_NSFW_VISIBILITY, payload: visible };
}

export function setUIScale(scale) {
  return { type: ActionTypes.SET_UI_SCALE, payload: scale };
}

export function getAppTokens() {
  return {
    type: ActionTypes.GET_APP_TOKENS,
    apiRequest: Api.getAppTokens,
  };
}

export function getAppTokensScopes() {
  return {
    type: ActionTypes.GET_APP_TOKENS_SCOPES,
    apiRequest: Api.getAppTokensScopes,
  };
}

export function createAppToken(params) {
  return {
    type: ActionTypes.CREATE_APP_TOKEN,
    apiRequest: Api.createAppToken,
    payload: params,
  };
}

export function createAppTokenReset() {
  return { type: reset(ActionTypes.CREATE_APP_TOKEN) };
}

export function reissueAppToken(tokenId) {
  return {
    type: ActionTypes.REISSUE_APP_TOKEN,
    apiRequest: Api.reissueAppToken,
    payload: tokenId,
  };
}

export function deleteAppToken(tokenId) {
  return {
    type: ActionTypes.DELETE_APP_TOKEN,
    apiRequest: Api.deleteAppToken,
    payload: tokenId,
  };
}

export function deleteAppTokenId(tokenId) {
  return {
    type: ActionTypes.DELETE_APP_TOKEN_ID,
    payload: tokenId,
  };
}

export function updateAppToken(tokenId, params) {
  return {
    type: ActionTypes.UPDATE_APP_TOKEN,
    apiRequest: Api.updateAppToken,
    payload: { tokenId, ...params },
  };
}

export function userCardClosing(userId) {
  return {
    type: ActionTypes.USER_CARD_CLOSING,
    payload: { userId },
  };
}

export function getServerInfo() {
  return {
    type: ActionTypes.GET_SERVER_INFO,
    apiRequest: Api.getServerInfo,
    nonAuthRequest: true,
  };
}

export function getExtAuthProfiles() {
  return {
    type: ActionTypes.GET_AUTH_PROFILES,
    apiRequest: Api.getExtAuthProfiles,
  };
}

export function connectToExtProvider(provider, popup) {
  return {
    type: ActionTypes.CONNECT_TO_EXTERNAL_PROVIDER,
    asyncOperation: Api.performExtAuth,
    payload: { provider, popup, mode: 'connect' },
  };
}

export function unlinkExternalProfile(profileId) {
  return {
    type: ActionTypes.UNLINK_EXTERNAL_PROFILE,
    apiRequest: Api.unlinkExternalProfile,
    payload: { id: profileId },
  };
}

export function signInViaExternalProvider(provider, popup) {
  return {
    type: ActionTypes.SIGN_IN_VIA_EXTERNAL_PROVIDER,
    asyncOperation: Api.performExtAuth,
    payload: { provider, popup, mode: 'sign-in' },
  };
}

export function hidePostsByCriterion(criterion, postId, doHide) {
  return {
    type: ActionTypes.HIDE_BY_CRITERION,
    apiRequest: Api.hidePostsByCriterion,
    payload: { postId, criterion, doHide },
  };
}

export function unhidePostsByCriteria(criteria, postId) {
  return {
    type: ActionTypes.UNHIDE_CRITERIA,
    apiRequest: Api.unhidePostsByCriteria,
    payload: { postId, criteria },
  };
}

export function removeRecentlyHiddenPost(postId) {
  return {
    type: ActionTypes.REMOVE_RECENTLY_HIDDEN_POST,
    payload: { postId },
  };
}

export function getAllGroups() {
  return {
    type: ActionTypes.GET_ALL_GROUPS,
    apiRequest: Api.getAllGroups,
    nonAuthRequest: true,
  };
}

export function listHomeFeeds() {
  return {
    type: ActionTypes.LIST_HOME_FEEDS,
    apiRequest: Api.listHomeFeeds,
  };
}

export function createHomeFeed({ title, subscribedTo }) {
  return {
    type: ActionTypes.CREATE_HOME_FEED,
    apiRequest: Api.createHomeFeed,
    payload: { title, subscribedTo },
  };
}

export function updateHomeFeed(feedId, { title, subscribedTo }) {
  return {
    type: ActionTypes.UPDATE_HOME_FEED,
    apiRequest: Api.updateHomeFeed,
    payload: { feedId, title, subscribedTo },
  };
}

export function deleteHomeFeed(feedId) {
  return {
    type: ActionTypes.DELETE_HOME_FEED,
    apiRequest: Api.deleteHomeFeed,
    payload: { feedId },
  };
}

export function subscribeWithHomeFeeds(type, user, homeFeeds) {
  return {
    type,
    apiRequest: Api.subscribeWithHomeFeeds,
    payload: { type, id: user.id, username: user.username, homeFeeds },
  };
}

export function updateSubscriptionReset(username) {
  return { type: reset(ActionTypes.UPDATE_SUBSCRIPTION), payload: { username } };
}

export function getAllSubscriptions() {
  return {
    type: ActionTypes.GET_ALL_SUBSCRIPTIONS,
    apiRequest: Api.getAllSubscriptions,
  };
}

export function updateHomeFeedReset() {
  return { type: reset(ActionTypes.UPDATE_HOME_FEED), payload: {} };
}

export function reorderHomeFeeds(feedIds) {
  return {
    type: ActionTypes.REORDER_HOME_FEEDS,
    apiRequest: Api.reorderHomeFeeds,
    payload: { feedIds },
  };
}

export function suspendMe(password) {
  return {
    type: ActionTypes.DEACTIVATE_USER,
    apiRequest: Api.suspendMe,
    payload: { password },
  };
}

export function resumeMe(resumeToken) {
  return {
    type: ActionTypes.ACTIVATE_USER,
    apiRequest: Api.resumeMe,
    nonAuthRequest: true,
    payload: { resumeToken },
  };
}

export function createAttachment(uploadId, file) {
  return {
    type: ActionTypes.CREATE_ATTACHMENT,
    asyncOperation: Api.createAttachment,
    payload: { uploadId, file, name: file.name },
  };
}

export function resetAttachmentUpload(uploadId) {
  return {
    type: reset(ActionTypes.CREATE_ATTACHMENT),
    payload: { uploadId },
  };
}

// Emulate the upload failure
export function setUploadError(uploadId, fileName, err) {
  return {
    type: fail(ActionTypes.CREATE_ATTACHMENT),
    request: { uploadId, name: fileName },
    payload: { err },
  };
}

export function setAttachment(attachment) {
  return {
    type: ActionTypes.SET_ATTACHMENT,
    payload: { attachments: attachment },
  };
}

export function signOut() {
  return {
    type: ActionTypes.SIGN_OUT,
    apiRequest: Api.signOut,
  };
}

export function reissueAuthSession() {
  return {
    type: ActionTypes.REISSUE_AUTH_SESSION,
    apiRequest: Api.reissueAuthSession,
  };
}

export function authTokenUpdated() {
  return {
    type: ActionTypes.AUTH_TOKEN_UPDATED,
  };
}

export function listAuthSessions() {
  return {
    type: ActionTypes.LIST_AUTH_SESSIONS,
    apiRequest: Api.listAuthSessions,
  };
}

export function closeAuthSessions(ids) {
  return {
    type: ActionTypes.CLOSE_AUTH_SESSIONS,
    apiRequest: Api.closeAuthSessions,
    payload: ids,
  };
}

export function setBetaChannel(enabled) {
  return {
    type: ActionTypes.SET_BETA_CHANNEL,
    payload: enabled,
  };
}

export function setOrbit(disabled) {
  return {
    type: ActionTypes.SET_ORBIT,
    payload: disabled,
  };
}

export function setAppVersion(version) {
  return {
    type: ActionTypes.APP_VERSION,
    payload: version,
  };
}

export function openSidebar(open = true) {
  return {
    type: ActionTypes.OPEN_SIDEBAR,
    payload: open,
  };
}

export function setSubmitMode(mode) {
  return {
    type: ActionTypes.SET_SUBMIT_MODE,
    payload: mode,
  };
}

export function leaveDirect(postId) {
  return {
    type: ActionTypes.LEAVE_DIRECT,
    apiRequest: Api.leaveDirect,
    payload: postId,
  };
}

export function getAttachmentsStats() {
  return {
    type: ActionTypes.GET_ATTACHMENTS_STATS,
    apiRequest: Api.getAttachmentsStats,
  };
}

export function sanitizeMedia() {
  return {
    type: ActionTypes.SANITIZE_MEDIA,
    apiRequest: Api.sanitizeMedia,
  };
}

export function getCommentByNumber(postId, seqNumber) {
  return {
    type: ActionTypes.GET_COMMENT_BY_NUMBER,
    apiRequest: Api.getCommentByNumber,
    payload: { postId, seqNumber },
  };
}

export function getGroupBlockedUsers(groupName) {
  return {
    type: ActionTypes.GET_GROUP_BLOCKED_USERS,
    apiRequest: Api.getGroupBlockedUsers,
    payload: { groupName },
  };
}

export function blockUserInGroup(groupName, username) {
  return {
    type: ActionTypes.BLOCK_USER_IN_GROUP,
    apiRequest: Api.blockUserInGroup,
    payload: { groupName, username },
  };
}

export function unblockUserInGroup(groupName, username) {
  return {
    type: ActionTypes.UNBLOCK_USER_IN_GROUP,
    apiRequest: Api.unblockUserInGroup,
    payload: { groupName, username },
  };
}

export function sendVerificationCode(email, mode) {
  return {
    type: ActionTypes.SEND_VERIFICATION_CODE,
    apiRequest: Api.sendVerificationCode,
    nonAuthRequest: true,
    payload: { email, mode },
  };
}

export function getInvitationsInfo() {
  return {
    type: ActionTypes.GET_INVITATIONS_INFO,
    apiRequest: Api.getInvitationsInfo,
    payload: {},
  };
}

export function disableBansInGroup(groupName) {
  return {
    apiRequest: Api.disableBansInGroup,
    type: ActionTypes.DISABLE_BANS_IN_GROUP,
    payload: { groupName },
  };
}

export function enableBansInGroup(groupName) {
  return {
    apiRequest: Api.enableBansInGroup,
    type: ActionTypes.ENABLE_BANS_IN_GROUP,
    payload: { groupName },
  };
}

export function getPostsByIds(postIds) {
  return {
    apiRequest: Api.getPostsByIds,
    type: ActionTypes.GET_POSTS_BY_IDS,
    payload: { postIds },
  };
}

export function getCommentsByIds(commentIds) {
  return {
    apiRequest: Api.getCommentsByIds,
    type: ActionTypes.GET_COMMENTS_BY_IDS,
    payload: { commentIds },
  };
}

export function setCurrentRoute(payload) {
  return {
    type: ActionTypes.SET_CURRENT_ROUTE,
    payload,
  };
}

export function translateText({ type, id, lang }) {
  return {
    apiRequest: Api.translateText,
    type: ActionTypes.TRANSLATE_TEXT,
    payload: { type, id, lang },
  };
}

export function resetTranslation({ type, id }) {
  return {
    type: reset(ActionTypes.TRANSLATE_TEXT),
    payload: { type, id },
  };
}

export function getBacklinks(postId, offset) {
  return {
    type: ActionTypes.GET_BACKLINKS,
    apiRequest: Api.getBacklinks,
    payload: { postId, offset },
  };
}

export function notifyOfAllComments(postId, enabled) {
  return {
    type: ActionTypes.NOTIFY_OF_ALL_COMMENTS,
    apiRequest: Api.notifyOfAllComments,
    payload: { postId, enabled },
  };
}

export function unlockComment(id) {
  return {
    type: ActionTypes.UNLOCK_COMMENT,
    apiRequest: Api.unlockComment,
    payload: { id },
  };
}

export function getMatchedUsers(query, fetchOptions) {
  return {
    type: ActionTypes.GET_MATCHED_USERS,
    apiRequest: Api.getMatchedUsers,
    payload: { query },
    fetchOptions,
  };
}
