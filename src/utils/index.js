/* global CONFIG */
import { filesize } from 'filesize';
import * as _ from 'lodash-es';
import { hashtags as tokenizeHashtags } from 'social-text-tokenizer';

import defaultUserpicPath from '../../assets/images/default-userpic.svg';

import { initialAsyncState } from '../redux/async-helpers';
import { deepMergeJSON } from './deep-merge';

export function getCookie(name) {
  const begin = document.cookie.indexOf(name);
  if (begin === -1) {
    return '';
  }
  const fromBegin = document.cookie.slice(begin);
  const tokenWithName = fromBegin.split(';');
  const tokenWithNameSplit = tokenWithName[0].split('=');
  const [, token] = tokenWithNameSplit;
  return token.trim();
}

export function setCookie(name, value = '', expireDays, path) {
  const expiresDate = Date.now() + expireDays * 24 * 60 * 60 * 1000;
  const expiresTime = new Date(expiresDate).toUTCString();
  //http://stackoverflow.com/questions/1134290/cookies-on-localhost-with-explicit-domain
  const cookie = `${name}=${value}; expires=${expiresTime}; path=${path}`;
  return (document.cookie = cookie);
}

export function deleteCookie(name, path) {
  return setCookie(name, '', -1, path);
}

/**
 * Fill missing user fields with default values
 *
 * @param {object} user user data from API response or cache
 * @returns {object}
 */
export function userParser(user) {
  return userParserFull(user);
}

/**
 * Configurable userParser
 */
export function userParserFull(
  user,
  { defaultValues, defaultOverrides, clientId } = CONFIG.frontendPreferences,
  defaultUserpic = defaultUserpicPath,
) {
  const newUser = { ...user };

  // Profile pictures
  newUser.profilePictureMediumUrl = user.profilePictureMediumUrl || defaultUserpic;
  newUser.profilePictureLargeUrl = user.profilePictureLargeUrl || defaultUserpic;

  // Frontend preferences (only use this client's subtree).
  // Do not fill them if no 'frontendPreferences' in 'user'.
  if (user.frontendPreferences) {
    let defaults = defaultValues;

    if (user.createdAt) {
      const createdAt = new Date(parseInt(user.createdAt, 10));
      for (const key of Object.keys(defaultOverrides)) {
        const { createdBefore, createdSince, value } = defaultOverrides[key];
        if (
          (createdBefore && createdAt < new Date(createdBefore)) ||
          (createdSince && createdAt >= new Date(createdSince))
        ) {
          // Lodash magic to return the minimal necessary clone of 'defaults'.
          // See https://github.com/lodash/lodash/issues/1696#issuecomment-328335502
          defaults = _.setWith(_.clone(defaults), key, value, _.clone);
        }
      }
    }

    // We use deepMergeJSON here to be sure that the resulting object has the
    // same structure as userDefaults.frontendPreferences.
    newUser.frontendPreferences = deepMergeJSON(defaults, user.frontendPreferences[clientId]);
  }

  return newUser;
}

export function postParser(post) {
  return {
    ...post,
    commentsDisabled: post.commentsDisabled === '1',
    savePostStatus: initialAsyncState,
    // All hashtags used in the post body
    hashtags: tokenizeHashtags()(post.body || '').map((t) => t.text),
  };
}

export function preventDefault(realFunction) {
  return (event) => {
    event.preventDefault();
    return realFunction && realFunction();
  };
}

export function isLeftClick(event) {
  return (
    event.type === 'click' &&
    event.button === 0 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey
  );
}

export function handleLeftClick(handler) {
  return (event, ...rest) => {
    if (!isLeftClick(event)) {
      return;
    }
    event.preventDefault();
    handler(event, ...rest);
  };
}

export function confirmFirst(realFunction) {
  return () => {
    if (confirm('Are you sure?')) {
      return realFunction && realFunction();
    }
  };
}

export function getCurrentRouteName(router) {
  return router && router.routes && router.routes[router.routes.length - 1].name;
}

export function pluralForm(n, singular, plural = null, format = 'n w') {
  let w;

  if (n == 1) {
    w = singular;
  } else if (plural) {
    w = plural;
  } else {
    w = `${singular}s`;
  }

  return format.replace('n', n).replace('w', w);
}

export function delay(timeout = 0) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

export function getSummaryPeriod(days) {
  switch (+days) {
    case 1:
      return 'day';
    case 7:
      return 'week';
    case 30:
      return 'month';
    default:
      return `${days} days`;
  }
}

export function formatFileSize(fileSize) {
  return filesize(fileSize, { base: 2, standard: 'iec', round: 1 });
}

export function htmlSafe(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
