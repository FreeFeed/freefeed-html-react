import { useDispatch, useSelector, useStore } from 'react-redux';
import { Link } from 'react-router';
import cn from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { useEvent } from 'react-use-event-hook';
import { faExternalLinkAlt, faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { Finder } from '../../utils/sparse-match';
import { UserPicture } from '../user-picture';
import { Icon } from '../fontawesome-icons';
import { usePost } from '../post/post-comment-ctx';
import { getMatchedUsers, showMoreComments } from '../../redux/action-creators';
import style from './autocomplete.module.scss';
import { HighlightText } from './highlight-text';
import {
  getAllGroups,
  getAllUsers,
  getMyFriends,
  getMyGroups,
  getMySubscribers,
  getPostParticipants,
  getRankedNames,
} from './ranked-names';

export function Selector({ query, events, onSelect, context, localLinks = false }) {
  query = query.toLowerCase();
  const [usernames, accountsMap, compare] = useAccountsMap({ context });
  useUsersRequest(query);

  const matches = useMemo(() => {
    const compareWithExact = (a, b) => {
      if (a.text === query) {
        return -1;
      }
      if (b.text === query) {
        return 1;
      }
      return compare(a, b);
    };
    const finder = new Finder(query, 5, compareWithExact);
    for (const username of usernames) {
      finder.add(username);
    }

    return finder.results();
  }, [compare, query, usernames]);

  const [cursor, setCursor] = useState(0);
  useEffect(() => setCursor(0), [matches]);

  const keyHandler = useEvent((key) => {
    switch (key) {
      case 'ArrowDown':
        setCursor((c) => (c + 1) % matches.length);
        break;
      case 'ArrowUp':
        setCursor((c) => (c - 1 + matches.length) % matches.length);
        break;
      case 'Enter':
      case 'Tab':
        onSelect(matches[cursor].text);
        break;
    }
  });

  useEffect(() => events.subscribe(keyHandler), [events, keyHandler]);

  if (matches.length === 0) {
    return null;
  }

  return (
    <div className={style.selector}>
      <ul className={style.list}>
        {matches.map((match, idx) => (
          <Item
            key={match.text}
            account={accountsMap.get(match.text)}
            match={match}
            isCurrent={idx === cursor}
            localLink={localLinks}
            onClick={onSelect}
          />
        ))}
      </ul>
    </div>
  );
}

function Item({ account, match, isCurrent, onClick, localLink }) {
  const clk = useEvent(() => onClick(match.text));
  const linkClk = useEvent((e) => e.stopPropagation());

  return (
    <li className={cn(style.item, isCurrent && style.itemCurrent)} onClick={clk}>
      <UserPicture user={account} size={20} withLink={false} className={style.itemImage} />
      <span className={style.itemText}>
        {account.type === 'group' && <Icon icon={faUserFriends} className={style.groupIcon} />}
        <span className={style.userName}>
          <HighlightText text={account.username} matches={match.matches} />
        </span>
        {account.username !== account.screenName && (
          <span className={style.screenName}>{account.screenName}</span>
        )}
      </span>
      {localLink ? (
        <Link to={`/${account.username}`} className={style.itemLink} onClick={linkClk}>
          <Icon
            className={cn(style.itemLinkIcon, style.itemLinkIconLocal)}
            icon={faExternalLinkAlt}
          />
        </Link>
      ) : (
        <a
          href={`/${account.username}`}
          target="_blank"
          className={style.itemLink}
          onClick={linkClk}
        >
          <Icon className={style.itemLinkIcon} icon={faExternalLinkAlt} />
        </a>
      )}
    </li>
  );
}

function useAccountsMap({ context }) {
  const lastAutocompleteQuery = useSelector((state) => state.lastAutocompleteQuery);
  const store = useStore();
  const post = usePost();

  useEffect(() => {
    if (context !== 'comment' || !post) {
      return;
    }
    const postState = store.getState().postsViewState[post?.id];
    if (post?.omittedComments > 0 && !postState?.loadingComments) {
      store.dispatch(showMoreComments(post.id));
    }
  }, [context, post, store]);

  return useMemo(() => {
    // We need to refresh this on lastAutocompleteQuery change
    lastAutocompleteQuery;

    const state = store.getState();
    const accountsMap = new Map();
    let rankedNames;

    const defaultRankings = [
      getMyFriends(state),
      getMyGroups(state),
      getMySubscribers(state),
      getAllUsers(state),
      getAllGroups(state),
    ];

    if (context === 'comment') {
      rankedNames = getRankedNames(post && getPostParticipants(post, state), ...defaultRankings);
    } else if (context === 'search') {
      rankedNames = getRankedNames(new Set(['me']), ...defaultRankings);
      accountsMap.set('me', { ...state.users[state.user.id], username: 'me' });
    } else {
      rankedNames = getRankedNames(...defaultRankings);
    }

    function compare(a, b) {
      const aRank = a.rank + 10 / (1 + (rankedNames.get(a.text) ?? 0));
      const bRank = b.rank + 10 / (1 + (rankedNames.get(b.text) ?? 0));
      if (aRank === bRank) {
        return a.text.localeCompare(b.text);
      }
      return bRank - aRank;
    }

    const allAccounts = [
      ...Object.values(state.users),
      ...Object.values(state.subscribers),
      ...state.user.subscribers,
    ];

    for (const account of allAccounts) {
      account.username && accountsMap.set(account.username, account);
    }

    return [[...accountsMap.keys()], accountsMap, compare];
  }, [context, post, store, lastAutocompleteQuery]);
}

function useUsersRequest(query) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (query.length < 2) {
      return;
    }

    const abortController = new AbortController();
    const { signal } = abortController;

    const t = setTimeout(() => dispatch(getMatchedUsers(query, { signal })), 500);
    signal.addEventListener('abort', () => clearTimeout(t));

    return () => abortController.abort();
  }, [query, dispatch]);
}
