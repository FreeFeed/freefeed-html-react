/* global CONFIG */
import { IndexLink, Link } from 'react-router';
import { faBars, faSearch, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { useCallback, useState } from 'react';
import cn from 'classnames';
import { useDispatch, useSelector } from 'react-redux';

import { openSidebar } from '../redux/action-creators';
import { Icon } from './fontawesome-icons';
import { useMediaQuery } from './hooks/media-query';
import styles from './layout-header.module.scss';
import { SignInLink } from './sign-in-link';
import { HeaderSearchForm } from './layout-header-search';

export function LayoutHeader() {
  const dispatch = useDispatch();
  const isLayoutWithSidebar = useMediaQuery('(min-width: 992px)');
  const isWideScreen = useMediaQuery('(min-width: 700px)');
  const isNarrowScreen = useMediaQuery('(max-width: 549px)');

  const authenticated = useSelector((state) => state.authenticated);

  const [searchExpanded, setSearchExpanded] = useState(false);

  const fullSearchForm = isWideScreen;
  const compactSearchForm = !fullSearchForm;
  const collapsibleSearchForm = isNarrowScreen;

  const openSearchForm = useCallback(() => setSearchExpanded(true), []);
  const closeSearchForm = useCallback(() => setSearchExpanded(false), []);

  const doOpenSidebar = useCallback(() => dispatch(openSidebar(true)), [dispatch]);

  const sidebarButton =
    !isLayoutWithSidebar &&
    (authenticated ? (
      <button
        type="button"
        aria-label="Open sidebar"
        title="Open sidebar"
        className={cn(styles.compactButton, styles.openSidebarButton)}
        onClick={doOpenSidebar}
      >
        <Icon icon={faBars} />
      </button>
    ) : (
      <SignInLink
        className={cn(styles.signInButton, styles.compactButton)}
        aria-label="Sign In"
        title="Sign In"
      >
        <Icon icon={faSignInAlt} />
      </SignInLink>
    ));

  return (
    <header
      className={cn(
        styles.header,
        fullSearchForm && styles.fullMode,
        compactSearchForm && styles.compactMode,
        collapsibleSearchForm && styles.collapsibleMode,
      )}
    >
      {searchExpanded ? (
        <div className={styles.searchExpandedCont}>
          {authenticated ? <HeaderSearchForm closeSearchForm={closeSearchForm} /> : null}
          {sidebarButton}
        </div>
      ) : (
        <>
          <h1 className={styles.logo}>
            <IndexLink className={styles.logoLink} to="/">
              {CONFIG.siteTitle}
            </IndexLink>
            {CONFIG.betaChannel.enabled && CONFIG.betaChannel.isBeta && (
              <Link to="/settings/appearance#beta" className="site-logo-subheading">
                {CONFIG.betaChannel.subHeading}
              </Link>
            )}
          </h1>
          <div className={styles.activeElements}>
            {authenticated && !collapsibleSearchForm ? (
              <HeaderSearchForm closeSearchForm={closeSearchForm} />
            ) : null}
            <span className={styles.buttons}>
              {authenticated && collapsibleSearchForm && (
                <button
                  type="button"
                  aria-label="Open search form"
                  title="Open search form"
                  onClick={openSearchForm}
                  className={styles.compactButton}
                >
                  <Icon icon={faSearch} />
                </button>
              )}
              {sidebarButton}
            </span>
          </div>
        </>
      )}
      {isLayoutWithSidebar && !authenticated && (
        <SignInLink className={styles.signInLink}>Sign In</SignInLink>
      )}
    </header>
  );
}
