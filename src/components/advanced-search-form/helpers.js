import { useState } from 'react';

export function useTextField(initialValue) {
  const [value, setValue] = useState(initialValue);
  const attrs = {
    value,
    onChange: (e) => setValue(e.target.value),
  };
  return [value, attrs];
}

export function useCheckboxField(initialValue) {
  const [value, setValue] = useState(initialValue);
  const attrs = {
    checked: value,
    onChange: (e) => setValue(e.target.checked),
  };
  return [value, attrs];
}

export const supportedFilters = [
  'in-my:friends',
  'in-my:discussions',
  'from:me',
  'in-my:messages',
  'in-my:saves',
  'by:me',
  'by:',
  'from:',
  'commented-by:',
  'post-date:>=',
  'post-date:<',
  'in:',
  'is:',
  'has:',
  'comments:',
  'likes:',
  'clikes:',
  'commented-by:',
  'cliked-by:',
  '-from:',
  '-in:',
  '-commented-by:',
  '-has:',
  '-is:',
];

export const intervalFilters = new Set(['comments:', 'likes:', 'clikes:']);
export const usernameFilters = new Set([
  'by:',
  'from:',
  'commented-by:',
  'liked-by:',
  'cliked-by:',
  'in:',
  '-in:',
  '-from:',
  '-commented-by:',
  '-liked-by:',
]);

export function usernames(text = '') {
  text = text.toLowerCase();
  const re = /[a-z\d-]+/g;
  let m;
  const result = [];
  while ((m = re.exec(text))) {
    result.push(m[0]);
  }
  return result.join(',');
}

/**
 * Parses a query string into a query text and an array of conditions
 *
 * @param {string} query
 */
export function parseQuery(query) {
  const result = {
    inPosts: true,
    inComments: true,
    text: '',
    filters: {},
  };
  const parts = query.split(/\s+/);
  if (parts.length === 0) {
    return result;
  }

  if (parts[0] === 'in-body:') {
    result.inComments = false;
    parts.shift();
  } else if (parts[0] === 'in-comments:') {
    result.inPosts = false;
    parts.shift();
  }

  const textParts = [];

  loop: for (const rawPart of parts) {
    const part = rawPart;
    for (const filter of supportedFilters) {
      if (part === filter) {
        if (filter in result.filters) {
          textParts.push(rawPart);
        } else {
          result.filters[filter] = '';
        }
        continue loop;
      }
      if (part.startsWith(filter)) {
        if (filter in result.filters) {
          textParts.push(rawPart);
        } else {
          result.filters[filter] = part.slice(filter.length);
        }
        continue loop;
      }
    }
    textParts.push(rawPart);
  }
  result.text = textParts.join(' ');
  return result;
}
