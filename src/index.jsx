import 'styles/common/common.scss';
import 'styles/helvetica/app.scss';
import 'index.jade';

require.context('assets/fonts', true, /fontawesome.*/i);

import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, IndexRoute, browserHistory} from 'react-router';
import {Provider} from 'react-redux';
import {syncHistoryWithStore} from 'react-router-redux';
import Autotrack from 'autotrack';

import configureStore from './redux/configure-store';
import * as ActionCreators from './redux/action-creators';

import Layout from './components/layout';
import Home from './components/home';
import Discussions from './components/discussions';
import About from './components/about';
import Dev from './components/dev';
import NotFound from './components/not-found';
import Signin from './components/signin';
import Signup from './components/signup';
import RestorePassword from './components/restore-password';
import ResetPassword from './components/reset-password';
import Settings from './components/settings';
import SinglePost from './components/single-post';
import User from './components/user';
import Subscribers from './components/subscribers';
import Subscriptions from './components/subscriptions';
import GroupSettings from './components/group-settings';
import GroupCreate from './components/group-create';
import Groups from './components/groups';
import SearchFeed from './components/search-feed';
import Friends from './components/friends';
import ManageSubscribers from './components/manage-subscribers';
import Bookmarklet from './components/bookmarklet';

const store = configureStore();

//request main info for user
if (store.getState().authenticated) {
  store.dispatch(ActionCreators.whoAmI());
  store.dispatch(ActionCreators.managedGroups());
} else {
  // just commented for develop sign up form
  store.dispatch(ActionCreators.unauthenticated());
}

import {bindRouteActions} from './redux/route-actions';

const boundRouteActions = bindRouteActions(store.dispatch);

const history = syncHistoryWithStore(browserHistory, store);

const manageSubscribersActions = next => {
  const username = next.params.userName;
  store.dispatch(ActionCreators.getUserInfo(username));
  store.dispatch(ActionCreators.subscribers(username));
};

const friendsActions = next => {
  const username = store.getState().user.username;
  store.dispatch(ActionCreators.subscribers(username));
  store.dispatch(ActionCreators.subscriptions(username));
  store.dispatch(ActionCreators.blockedByMe(username));
};

// needed to display mutual friends
const subscribersSubscriptionsActions = next => {
  const username = next.params.userName;
  store.dispatch(ActionCreators.subscribers(username));
  store.dispatch(ActionCreators.subscriptions(username));
};

const enterStaticPage = title => () => {
  store.dispatch(ActionCreators.staticPage(title));
};

history.listen(_ => scrollTo(0, 0));

const generateRouteHooks = callback => ({
  onEnter: callback,
  onChange: (_, next) => callback(next),
});

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route name='bookmarklet' path='/bookmarklet' component={Bookmarklet}/>

      <Route path='/' component={Layout}>
        <IndexRoute name='home' component={Home} {...generateRouteHooks(boundRouteActions('home'))}/>
        <Route path='about' component={About} onEnter={enterStaticPage('About')}/>
        <Route path='dev' component={Dev} onEnter={enterStaticPage('Developers')}/>
        <Route path='signin' component={Signin} onEnter={enterStaticPage('Sign in')}/>
        <Route path='signup' component={Signup} onEnter={enterStaticPage('Sign up')}/>
        <Route path='restore' component={RestorePassword}/>
        <Route path='reset' component={ResetPassword}/>
        <Route path='settings' component={Settings} onEnter={enterStaticPage('Settings')}/>
        <Route name='groupSettings' path='/:userName/settings' component={GroupSettings} {...generateRouteHooks(boundRouteActions('getUserInfo'))}/>
        <Route name='discussions' path='filter/discussions' component={Discussions} {...generateRouteHooks(boundRouteActions('discussions'))}/>
        <Route name='direct' path='filter/direct' component={Discussions} {...generateRouteHooks(boundRouteActions('direct'))}/>
        <Route name='search' path='search' component={SearchFeed} {...generateRouteHooks(boundRouteActions('search'))}/>
        <Route name='groups' path='/groups' component={Groups} onEnter={enterStaticPage('Groups')}/>
        <Route name='friends' path='/friends' component={Friends} onEnter={friendsActions}/>
        <Route name='groupCreate' path='/groups/create' component={GroupCreate} onEnter={enterStaticPage('Create a group')}/>
        <Route name='userFeed' path='/:userName' component={User} {...generateRouteHooks(boundRouteActions('userFeed'))}/>
        <Route name='subscribers' path='/:userName/subscribers' component={Subscribers} onEnter={subscribersSubscriptionsActions}/>
        <Route name='subscriptions' path='/:userName/subscriptions' component={Subscriptions} onEnter={subscribersSubscriptionsActions}/>
        <Route name='manage-subscribers' path='/:userName/manage-subscribers' component={ManageSubscribers} onEnter={manageSubscribersActions}/>
        <Route name='userComments' path='/:userName/comments' component={User} {...generateRouteHooks(boundRouteActions('userComments'))}/>
        <Route name='userLikes' path='/:userName/likes' component={User} {...generateRouteHooks(boundRouteActions('userLikes'))}/>
        <Route name='post' path='/:userName/:postId' component={SinglePost} {...generateRouteHooks(boundRouteActions('post'))}/>
      </Route>
    </Router>
  </Provider>,
  document.getElementById('app')
);
