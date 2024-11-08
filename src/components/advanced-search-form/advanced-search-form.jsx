import cn from 'classnames';
import { browserHistory } from 'react-router';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { useEvent } from 'react-use-event-hook';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useMediaQuery } from '../hooks/media-query';
import { ButtonLink } from '../button-link';
import { Icon } from '../fontawesome-icons';
import { useSearchQuery } from '../hooks/search-query';
import style from './advanced-search-form.module.scss';
import { BoolInput } from './bool-input';
import { ChooseInput } from './choose-input';
import { Columns } from './columns';
import { IntervalInput } from './interval-input';
import { Section } from './section';
import { TextInput } from './text-input';
import {
  intervalFilters,
  parseQuery,
  useCheckboxField,
  usernameFilters,
  usernames,
  useTextField,
} from './helpers';
import { reducer } from './reducer';
import { filtersContext } from './context';

export function AdvancedSearchForm() {
  const isWideScreen = useMediaQuery('(min-width: 768px)');
  const [formExpanded, setFormExpanded] = useState(false);
  const [docsExpanded, setDocsExpanded] = useState(false);

  const expandForm = useEvent(() => setFormExpanded(true));
  const expandDocs = useEvent(() => setDocsExpanded(true));

  useEffect(() => {
    if (isWideScreen) {
      setFormExpanded(false);
      setDocsExpanded(false);
    }
  }, [isWideScreen]);

  const showFullForm = isWideScreen || formExpanded;
  const showFullDocs = isWideScreen || docsExpanded;

  const initialQuery = parseQuery(useSearchQuery());

  const [query, queryAttrs] = useTextField(initialQuery.text);
  const [inPosts, inPostsAttrs] = useCheckboxField(initialQuery.inPosts);
  const [inComments, inCommentsAttrs] = useCheckboxField(initialQuery.inComments);

  const [filters, dispatch] = useReducer(reducer, initialQuery.filters);
  const ctxValue = useMemo(() => [filters, dispatch], [filters, dispatch]);

  const resultingQuery = useMemo(() => {
    if (!inPosts && !inComments) {
      return '';
    }
    return [
      inPosts && !inComments ? 'in-body:' : '',
      inComments && !inPosts ? 'in-comments:' : '',
      query.trim(),
      ...Object.entries(filters).map(([k, v]) => {
        if (intervalFilters.has(k) && !/\d/.test(v)) {
          return null;
        }
        if (usernameFilters.has(k)) {
          v = usernames(v);
        }
        return k + v;
      }),
    ]
      .filter(Boolean)
      .join(' ');
  }, [inPosts, inComments, query, filters]);

  const onSearch = useEvent(() =>
    browserHistory.push(`/search?q=${encodeURIComponent(resultingQuery)}`),
  );

  const onKeyDown = useEvent((e) => {
    if (
      e.code === 'Enter' &&
      e.target.matches('input[type="text"], input[type="date"], input[type="search"]')
    ) {
      e.preventDefault();
      onSearch();
    }
  });

  return (
    <filtersContext.Provider value={ctxValue}>
      <div className={style.form} onKeyDown={onKeyDown}>
        <Section title="What to search">
          <div className={style.searchInputBox}>
            <input
              type="search"
              name="q"
              {...queryAttrs}
              className="form-control"
              placeholder="Text to search"
            />
            <button
              type="button"
              disabled={resultingQuery === ''}
              className={cn('btn btn-primary')}
              onClick={onSearch}
            >
              Search
            </button>
          </div>
          <div className={style.searchScopes}>
            Search for:
            <label>
              <input type="checkbox" {...inPostsAttrs} /> posts
            </label>
            <label>
              <input type="checkbox" {...inCommentsAttrs} /> comments
            </label>
          </div>
        </Section>
        <Section title="Search only in">
          <Columns>
            <BoolInput
              label="My friends and groups"
              filter="in-my:friends"
              value={filters['in-my:friends']}
            />
            <BoolInput label="My discussions" filter="in-my:discussions" />
            <BoolInput label="My posts" filter="from:me" />
            <BoolInput label="My direct messages" filter="in-my:messages" />
            <BoolInput label="My saved posts" filter="in-my:saves" />
            <BoolInput label="All content written by me" filter="by:me" />
          </Columns>
        </Section>
        <Section title="With conditions">
          <Columns>
            <TextInput label="Group/user feeds" placeholder="group1, user2" filter="in:" />
            <TextInput label="Content written by users" placeholder="user1, user2" filter="by:" />
            <TextInput label="Posts written by users" placeholder="user1, user2" filter="from:" />
            <TextInput
              label="Posts commented by users"
              placeholder="user1, user2"
              filter="commented-by:"
            />
            <TextInput label="Posts created after" type="date" filter="post-date:>=" />
            <TextInput label="Posts created before" type="date" filter="post-date:<" />
            {showFullForm ? (
              <>
                <ChooseInput label="Posts with privacy" filter="is:">
                  <option value="">Any</option>
                  <option value="public">Public</option>
                  <option value="protected">Protected</option>
                  <option value="private">Private</option>
                </ChooseInput>
                <ChooseInput label="Posts with attachments" filter="has:">
                  <option value="">With or without</option>
                  <option value="images">Images</option>
                  <option value="audio">Audio</option>
                  <option value="files">Any files</option>
                </ChooseInput>
                <IntervalInput label="Post comments count" filter="comments:" />
                <TextInput
                  label="Posts liked by users"
                  placeholder="user1, user2"
                  filter="liked-by:"
                />
                <IntervalInput label="Post likes count" filter="likes:" />
                <TextInput
                  label="Comments liked by users"
                  placeholder="user1, user2"
                  filter="cliked-by:"
                />
                <IntervalInput label="Comment likes count" filter="clikes:" />
              </>
            ) : null}
          </Columns>
        </Section>
        {showFullForm ? (
          <Section title="Exclusions">
            <Columns>
              <TextInput
                label="Exclude posts written by users"
                placeholder="user1, user2"
                filter="-from:"
              />
              <TextInput
                label="Exclude group/user feeds"
                placeholder="group1, user2"
                filter="-in:"
              />
              <TextInput
                label="Exclude posts commented by users"
                placeholder="user1, user2"
                filter="-commented-by:"
              />
              <TextInput
                label="Exclude posts liked by users"
                placeholder="user1, user2"
                filter="-liked-by:"
              />
              <ChooseInput label="Exclude posts with attachments" filter="-has:">
                <option value="">Don&#x2019;t exclude</option>
                <option value="images">Images</option>
                <option value="audio">Audio</option>
                <option value="files">Any files</option>
              </ChooseInput>
              <ChooseInput label="Exclude posts with privacy" filter="-is:">
                <option value="">Any</option>
                <option value="public">Public</option>
                <option value="protected">Protected</option>
                <option value="private">Private</option>
              </ChooseInput>
            </Columns>
          </Section>
        ) : null}
        {!showFullForm ? (
          <p>
            <ButtonLink onClick={expandForm}>
              <Icon icon={faChevronDown} className={style.expandIcon} /> Show all conditions
            </ButtonLink>
          </p>
        ) : null}
        <Section sticky>
          <button
            type="button"
            disabled={resultingQuery === ''}
            className={cn('btn btn-primary', style.bigSearchButton)}
            onClick={onSearch}
          >
            Search
          </button>
        </Section>
        {resultingQuery ? (
          <p>
            Search query:{' '}
            <ButtonLink tag="code" onClick={onSearch}>
              {resultingQuery}
            </ButtonLink>
          </p>
        ) : null}
        {showFullDocs ? (
          <>
            {' '}
            <p>
              Use double-quotes to search words in the exact form and specific word order:{' '}
              <em>&quot;freefeed version&quot;</em>
              <br />
              Use the asterisk symbol (<code>*</code>) to search word by prefix: <em>free*</em>. The
              minimum prefix length is two characters.
              <br />
              Use the pipe symbol (<code>|</code>) between words to search any of them:{' '}
              <em>freefeed | version</em>
              <br />
              Use the minus sign (<code>-</code>) to exclude some word from search results:{' '}
              <em>freefeed -version</em>
              <br />
              Use the plus sign (<code>+</code>) to specify word order: <em>freefeed + version</em>
              <br />
            </p>
            <p>
              Learn the{' '}
              <a
                href="https://github.com/FreeFeed/freefeed-server/wiki/FreeFeed-Search"
                target="_blank"
              >
                full query syntax
              </a>{' '}
              for more advanced search requests.
            </p>
          </>
        ) : (
          <>
            <p>
              Use double-quotes to search words in the exact form and specific word order:{' '}
              <em>&quot;freefeed version&quot;</em>
              <br />
              Use the asterisk symbol (<code>*</code>) to search word by prefix: <em>free*</em>. The
              minimum prefix length is two characters.
            </p>
            <p>
              <ButtonLink onClick={expandDocs}>
                <Icon icon={faChevronDown} className={style.expandIcon} /> Show search query syntax
                help
              </ButtonLink>
            </p>
          </>
        )}
      </div>
    </filtersContext.Provider>
  );
}
