/* global CONFIG */
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory, Redirect } from 'react-router';
import { Provider, useSelector } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import * as Sentry from '@sentry/react';
import 'focus-visible';

import 'autotrack'; // used by google-analytics in ../index.jade

import '../styles/common/common.scss';
import '../styles/helvetica/app.scss';
import '../styles/helvetica/dark-theme.scss';

import configureStore from './redux/configure-store';
import * as ActionCreators from './redux/action-creators';

import Layout from './components/layout';
import Home from './components/home';
import Discussions from './components/discussions';
import Summary from './components/summary';
import SinglePost from './components/single-post';
import User from './components/user';
import Subscribers from './components/subscribers';
import Subscriptions from './components/subscriptions';
import Groups from './components/groups';
import SearchFeed from './components/search-feed';
import PlainFeed from './components/plain-feed';
import ManageSubscribers from './components/manage-subscribers';
import Bookmarklet from './components/bookmarklet';
import CalendarYear from './components/calendar/calendar-year';
import CalendarMonth from './components/calendar/calendar-month';
import CalendarDate from './components/calendar/calendar-date';
import SignupByInvitation from './components/signup-by-invitation';
import { settingsRoute } from './components/settings/routes';
import { CALENDAR_START_YEAR } from './utils/calendar-utils';

Sentry.init({
  dsn: CONFIG.sentry.publicDSN,
  autoSessionTracking: false,
});

const store = configureStore();

import { bindRouteActions } from './redux/route-actions';
import { initUnscroll, safeScrollTo } from './services/unscroll';
import { lazyRetry } from './utils/retry-promise';
import { HomeAux } from './components/home-aux';
import { NotFound } from './components/not-found';
import { DialogProvider } from './components/dialog/context';

// Set initial history state.
// Without this, there can be problems with third-party
// modules using history API (specifically, PhotoSwipe).
browserHistory.replace({
  pathname: location.pathname,
  search: location.search,
  hash: location.hash,
});

const boundRouteActions = bindRouteActions(store.dispatch);

const history = syncHistoryWithStore(browserHistory, store);

const thisYear = new Date().getFullYear();

const manageSubscribersActions = (next) => {
  const { userName } = next.params;
  store.dispatch(ActionCreators.getUserInfo(userName));
  store.dispatch(ActionCreators.subscribers(userName));
};

const inviteActions = () => {
  const { username } = store.getState().user;
  store.dispatch(ActionCreators.subscriptions(username));
  store.dispatch(ActionCreators.getInvitationsInfo());
};

// needed to display mutual friends
const subscribersSubscriptionsActions = (next, replace) => {
  const { userName } = next.params;

  if (userName === store.getState().user.username) {
    const route = next.routes[next.routes.length - 1];
    replace(`/friends?show=${route.name}`);
    return;
  }

  store.dispatch(ActionCreators.subscribers(userName));
  store.dispatch(ActionCreators.subscriptions(userName));
};

const enterStaticPage = (title) => () => {
  store.dispatch(ActionCreators.staticPage(title));
};

history.listen(() => safeScrollTo(0, 0));

const generateRouteHooks = (callback) => ({
  onEnter: callback,
  onChange: (_, next) => callback(next),
});

// For some reason, the import() argument must have an explicit string type.
// See https://github.com/webpack/webpack/issues/4921#issuecomment-357147299
const lazyLoad = (path, importName = 'default') =>
  lazyRetry(() => import(`${path}`).then((m) => ({ default: m[importName] })));

function InitialLayout({ children }) {
  return (
    <div className="container">
      <div className="row header-row">
        <div className="col-md-4">
          <div className="header">
            <h1 className="title">
              <a href="/">{CONFIG.siteTitle}</a>
            </h1>
            <div className="jsonly">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

initUnscroll();
// Fetch server info on application start
setTimeout(() => store.dispatch(ActionCreators.getServerInfo()), 0);

function App() {
  const initialized = useSelector((state) => state.initialized);
  if (initialized.initial || initialized.loading) {
    return (
      <InitialLayout>
        <p>Loading...</p>
      </InitialLayout>
    );
  }

  if (initialized.error) {
    return (
      <InitialLayout>
        <div className="alert alert-danger" role="alert">
          <p>Cannot load page: {initialized.errorText}</p>
          <p>Try to reload this page later.</p>
        </div>
      </InitialLayout>
    );
  }

  return (
    <Router history={history}>
      <Route name="bookmarklet" path="/bookmarklet" component={Bookmarklet} />

      <Route path="/" component={Layout}>
        <IndexRoute
          name="home"
          component={Home}
          {...generateRouteHooks(boundRouteActions('home'))}
        />
        <Route path="/list/:listId(/:listTitle)" name="homeAux" component={HomeAux} />
        <Route path="about">
          <IndexRoute
            name="about"
            component={lazyLoad('./components/about')}
            onEnter={enterStaticPage('About')}
          />
          <Route
            path="terms"
            component={lazyLoad('./components/terms')}
            onEnter={enterStaticPage('Terms')}
          />
          <Route
            path="privacy"
            component={lazyLoad('./components/privacy')}
            onEnter={enterStaticPage('Privacy')}
          />
          <Route
            path="stats"
            component={lazyLoad('./components/stats')}
            onEnter={enterStaticPage('Stats')}
          />
          <Route
            path="donate"
            component={lazyLoad('./components/donate')}
            onEnter={enterStaticPage('Donate')}
          />
        </Route>
        <Route
          path="dev"
          component={lazyLoad('./components/dev')}
          onEnter={enterStaticPage('Developers')}
        />
        <Route
          path="signin"
          component={lazyLoad('./components/signin')}
          onEnter={enterStaticPage('Sign in')}
        />
        <Route
          path="signup"
          component={lazyLoad('./components/signup')}
          onEnter={enterStaticPage('Sign up')}
        />
        <Route path="restore" component={lazyLoad('./components/restore-password')} />
        <Route path="reset" component={lazyLoad('./components/reset-password')} />
        {settingsRoute('settings')}
        <Route
          path="settings/archive"
          component={lazyLoad('./components/archive')}
          onEnter={enterStaticPage('Restore from FriendFeed.com Archives')}
        />
        <Route
          name="groupSettings"
          path="/:userName/settings"
          component={lazyLoad('./components/group-settings')}
          {...generateRouteHooks(boundRouteActions('getUserInfo'))}
        />
        <Route
          name="discussions"
          path="filter/discussions"
          component={Discussions}
          {...generateRouteHooks(boundRouteActions('discussions'))}
        />
        <Route
          name="saves"
          path="filter/saves"
          component={Discussions}
          {...generateRouteHooks(boundRouteActions('saves'))}
        />
        <Route
          name="summary"
          path="/summary(/:days)"
          component={Summary}
          {...generateRouteHooks(boundRouteActions('summary'))}
        />
        <Route
          name="direct"
          path="filter/direct"
          component={Discussions}
          {...generateRouteHooks(boundRouteActions('direct'))}
        />
        <Route
          name="search"
          path="search"
          component={SearchFeed}
          {...generateRouteHooks(boundRouteActions('search'))}
        />
        <Route
          name="notifications"
          path="filter/notifications"
          component={lazyLoad('./components/notifications')}
          {...generateRouteHooks(boundRouteActions('notifications'))}
        />
        <Route
          name="best_of"
          path="filter/best_of"
          component={PlainFeed}
          {...generateRouteHooks(boundRouteActions('best_of'))}
        />
        <Route
          name="everything"
          path="filter/everything"
          component={PlainFeed}
          {...generateRouteHooks(boundRouteActions('everything'))}
        />
        <Route
          name="groups"
          path="/groups"
          component={Groups}
          onEnter={enterStaticPage('Groups')}
        />
        <Route
          name="all-groups"
          path="/all-groups"
          component={lazyLoad('./components/all-groups')}
        />
        <Route
          name="friends"
          path="/friends"
          component={lazyLoad('./components/friends-page', 'Friends')}
        />
        <Route
          name="groupCreate"
          path="/groups/create"
          component={lazyLoad('./components/group-create')}
          onEnter={enterStaticPage('Create a group')}
        />
        <Route
          name="archivePost"
          path="/archivePost"
          component={lazyLoad('./components/archive-post')}
          {...generateRouteHooks(boundRouteActions('archivePost'))}
        />
        <Route
          name="createInvitation"
          path="/invite"
          component={lazyLoad('./components/invitation-creation-form')}
          onEnter={inviteActions}
        />
        <Route
          name="signupByInvitation"
          path="/invited/:invitationId"
          component={SignupByInvitation}
        />
        <Route
          name="userFeed"
          path="/:userName"
          component={checkPath(User, isAccountPath)}
          {...generateRouteHooks(boundRouteActions('userFeed'))}
        />
        <Route
          name="memories"
          path="/memories/:from"
          component={checkPath(PlainFeed, isMemoriesPath)}
          {...generateRouteHooks(boundRouteActions('memories'))}
        />
        <Route
          name="userMemories"
          path="/:userName/memories/:from"
          component={checkPath(PlainFeed, isMemoriesPath)}
          {...generateRouteHooks(boundRouteActions('userMemories'))}
        />

        <Redirect from="/:userName/calendar" to={`/:userName/calendar/${thisYear}`} />
        <Route
          name="userCalendarYear"
          path="/:userName/calendar/:year"
          component={checkPath(CalendarYear, isCalendarYearPath)}
          {...generateRouteHooks(boundRouteActions('calendarYear'))}
        />
        <Route
          name="userCalendarMonth"
          path="/:userName/calendar/:year/:month"
          component={checkPath(CalendarMonth, isCalendarMonthPath)}
          {...generateRouteHooks(boundRouteActions('calendarMonth'))}
        />
        <Route
          name="userCalendarDate"
          path="/:userName/calendar/:year/:month/:day"
          component={checkPath(CalendarDate, isCalendarDatePath)}
          {...generateRouteHooks(boundRouteActions('calendarDate'))}
        />

        <Route
          name="userSummary"
          path="/:userName/summary(/:days)"
          component={User}
          {...generateRouteHooks(boundRouteActions('userSummary'))}
        />
        <Route
          name="subscribers"
          path="/:userName/subscribers"
          component={Subscribers}
          onEnter={subscribersSubscriptionsActions}
        />
        <Route
          name="subscriptions"
          path="/:userName/subscriptions"
          component={Subscriptions}
          onEnter={subscribersSubscriptionsActions}
        />
        <Route
          name="manage-subscribers"
          path="/:userName/manage-subscribers"
          component={ManageSubscribers}
          onEnter={manageSubscribersActions}
        />
        <Route
          name="userComments"
          path="/:userName/comments"
          component={User}
          {...generateRouteHooks(boundRouteActions('userComments'))}
        />
        <Route
          name="userLikes"
          path="/:userName/likes"
          component={User}
          {...generateRouteHooks(boundRouteActions('userLikes'))}
        />
        <Redirect from="/.well-known/change-password" to="/settings/sign-in" />
        <Route
          name="post"
          path="/:userName/:postId"
          component={checkPath(SinglePost, isPostPath)}
          {...generateRouteHooks(boundRouteActions('post'))}
        />
        <Route name="404" path="*" component={NotFound} />
      </Route>
    </Router>
  );
}

ReactDOM.render(
  <Provider store={store}>
    <DialogProvider>
      <App />
    </DialogProvider>
  </Provider>,
  document.querySelector('#app'),
);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register(`${location.origin}/service-worker.js`)
    // eslint-disable-next-line promise/always-return
    .then((reg) => {
      console.log('Service worker registered.', reg);
    })
    .catch((err) => {
      console.log(err);
    });
}

function checkPath(Component, checker) {
  return (props) => {
    return checker(props) ? <Component {...props} /> : <NotFound {...props} />;
  };
}

function isPostPath({ params: { postId, userName } }) {
  // The FreeFeed's usernames can have up to 25 characters length now, but some
  // old grops can have up to 27 characters in username
  return (
    /^[a-z\d-]{3,30}$/i.test(userName) &&
    /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i.test(postId)
  );
}

function isAccountPath({ params: { userName } }) {
  // The FreeFeed's usernames can have up to 25 characters length now, but some
  // old grops can have up to 27 characters in username
  return /^[a-z\d-]{3,30}$/i.test(userName);
}

function isMemoriesPath({ params: { userName, from } }) {
  const kindaValidDate = /^20\d\d(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])$/i.test(from);
  const validUsername = typeof userName === 'undefined' || isAccountPath({ params: { userName } });
  return kindaValidDate && validUsername;
}

const isValidCalendarYear = (year) => {
  const yearAsInt = parseInt(year, 10);
  return yearAsInt >= CALENDAR_START_YEAR && yearAsInt <= thisYear;
};

const isValidMonth = (month) => {
  const monthAsInt = parseInt(month, 10);
  return monthAsInt >= 1 && monthAsInt <= 12;
};

const isValidDay = (day) => {
  const dayAsInt = parseInt(day, 10);
  return dayAsInt >= 1 && dayAsInt <= 31;
};

function isCalendarYearPath({ params: { userName, year } }) {
  const validUsername = typeof userName === 'undefined' || isAccountPath({ params: { userName } });
  return isValidCalendarYear(year) && validUsername;
}

function isCalendarMonthPath({ params: { userName, year, month } }) {
  const validUsername = typeof userName === 'undefined' || isAccountPath({ params: { userName } });
  return isValidCalendarYear(year) && isValidMonth(month) && validUsername;
}

function isCalendarDatePath({ params: { userName, year, month, day } }) {
  const validUsername = typeof userName === 'undefined' || isAccountPath({ params: { userName } });
  return isValidCalendarYear(year) && isValidMonth(month) && isValidDay(day) && validUsername;
}
