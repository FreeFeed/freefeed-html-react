import React from 'react';
import { Link } from 'react-router';

import { preventDefault, pluralForm } from '../utils';
import CreatePost from './create-post';
import PieceOfText from './piece-of-text';
import ErrorBoundary from './error-boundary';
import { Throbber } from './throbber';

export default class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isUnsubWarningDisplayed: false };
  }

  UNSAFE_componentWillReceiveProps = () => {
    this.setState({ isUnsubWarningDisplayed: false });
  };

  componentDidMount() {
    if (this.props.username && this.props.canAcceptDirects === undefined) {
      this.props.getUserInfo(this.props.username);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.username !== prevProps.username) {
      if (this.props.username && this.props.canAcceptDirects === undefined) {
        this.props.getUserInfo(this.props.username);
      }
    }
  }

  handleRequestSubscriptionClick = preventDefault(() => {
    const { id, sendSubscriptionRequest, username } = this.props;
    sendSubscriptionRequest({ username, id });
  });

  handleSubscribeClick = preventDefault(() => {
    const { id, subscribe, username } = this.props;
    subscribe({ username, id });
  });

  handleUnsubscribeClick = preventDefault(() => {
    const { amIGroupAdmin, id, unsubscribe, username } = this.props;

    if (amIGroupAdmin) {
      this.setState({ isUnsubWarningDisplayed: true });
    } else if (window.confirm(`Are you sure you want to unsubscribe from @${username}?`)) {
      unsubscribe({ username, id });
    }
  });

  handleBlockUserClick = preventDefault(() => {
    const { ban, id, username } = this.props;
    ban({ username, id });
  });

  render() {
    const { props } = this;

    return (
      <div>
        <ErrorBoundary>
          {!props.isLoading && !props.isUserFound ? (
            <h2>User not found</h2>
          ) : (
            <div className="profile">
              <div className="row">
                <div className="col-sm-9 col-xs-12">
                  <div className="avatar">
                    <img src={props.profilePictureLargeUrl} width="75" height="75" />
                  </div>
                  <div className="description">
                    <div className="name" dir="auto">
                      {props.screenName}
                    </div>
                    <PieceOfText text={props.description} isExpanded={true} />
                  </div>
                </div>
                {props.statistics && !props.blocked ? (
                  <div className="col-sm-3 col-xs-12">
                    <div className="profile-stats">
                      {props.type !== 'group' && props.statistics.subscriptions >= 0 ? (
                        <div className="profile-stats-item">
                          {props.canISeeSubsList ? (
                            <Link to={`/${props.username}/subscriptions`}>
                              {pluralForm(props.statistics.subscriptions, 'subscription')}
                            </Link>
                          ) : (
                            pluralForm(props.statistics.subscriptions, 'subscription')
                          )}
                        </div>
                      ) : (
                        false
                      )}{' '}
                      {props.statistics.subscribers >= 0 ? (
                        <div className="profile-stats-item">
                          {props.canISeeSubsList ? (
                            <Link to={`/${props.username}/subscribers`}>
                              {pluralForm(props.statistics.subscribers, 'subscriber')}
                            </Link>
                          ) : (
                            pluralForm(props.statistics.subscribers, 'subscriber')
                          )}
                        </div>
                      ) : (
                        false
                      )}{' '}
                      {props.type !== 'group' && props.statistics.comments >= 0 ? (
                        <div className="profile-stats-item">
                          <Link to={`/${props.username}/comments`}>
                            {pluralForm(props.statistics.comments, 'comment')}
                          </Link>
                        </div>
                      ) : (
                        false
                      )}{' '}
                      {props.type !== 'group' && props.statistics.likes >= 0 ? (
                        <div className="profile-stats-item">
                          <Link to={`/${props.username}/likes`}>
                            {pluralForm(props.statistics.likes, 'like')}
                          </Link>
                        </div>
                      ) : (
                        false
                      )}
                    </div>
                  </div>
                ) : (
                  false
                )}
              </div>
            </div>
          )}

          {props.authenticated && props.isUserFound && !props.isItMe && !props.blocked ? (
            <div className="profile-controls">
              <div className="row">
                <div className="col-xs-7 col-sm-7 subscribe-controls">
                  {props.isPrivate === '1' && !props.subscribed ? (
                    props.hasRequestBeenSent ? (
                      <span>
                        <b>{props.screenName}</b> has been sent your subscription request.
                      </span>
                    ) : (
                      <a onClick={this.handleRequestSubscriptionClick}>Request a subscription</a>
                    )
                  ) : props.subscribed ? (
                    <a onClick={this.handleUnsubscribeClick}>Unsubscribe</a>
                  ) : (
                    <a onClick={this.handleSubscribeClick}>Subscribe</a>
                  )}

                  {props.subscribingStatus.loading && (
                    <span className="profile-controls-throbber">
                      <Throbber />
                    </span>
                  )}
                  {props.subscribingStatus.error && (
                    <div className="alert alert-danger p-settings-alert" role="alert">
                      {props.subscribingStatus.errorText}
                    </div>
                  )}
                </div>
                <div className="col-xs-5 col-sm-5 text-right">
                  <ul className="profile-actions">
                    {props.canAcceptDirects ? (
                      <li>
                        <Link to={`/filter/direct?to=${props.username}`}>Direct message</Link>
                      </li>
                    ) : (
                      false
                    )}
                    {props.type === 'group' && props.subscribed && (
                      <li>
                        <Link to={`/filter/direct?invite=${props.username}`}>Invite</Link>
                      </li>
                    )}
                    {props.type !== 'group' && !props.subscribed ? (
                      <li>
                        <a onClick={this.handleBlockUserClick}>Block this user</a>
                        {props.blockingStatus.loading && (
                          <span className="profile-controls-throbber">
                            <Throbber />
                          </span>
                        )}
                      </li>
                    ) : props.amIGroupAdmin ? (
                      <li>
                        <Link to={`/${props.username}/settings`}>Settings</Link>
                      </li>
                    ) : (
                      false
                    )}
                  </ul>
                  {props.blockingStatus.error && (
                    <div className="alert alert-danger p-settings-alert" role="alert">
                      {props.blockingStatus.errorText}
                    </div>
                  )}
                </div>
              </div>
              {this.state.isUnsubWarningDisplayed ? (
                <div className="row">
                  <div className="col-xs-12">
                    <p className="group-warning">
                      You are the Admin for this group. If you want to unsubscribe please drop
                      administrative privileges first at{' '}
                      <Link to={`/${props.username}/manage-subscribers`}>manage subscribers</Link>{' '}
                      page
                    </p>
                  </div>
                </div>
              ) : (
                false
              )}
            </div>
          ) : (
            false
          )}

          {props.canIPostHere ? (
            <CreatePost
              createPostViewState={props.createPostViewState}
              sendTo={props.sendTo}
              user={props.user}
              createPost={props.createPost}
              resetPostCreateForm={props.resetPostCreateForm}
              expandSendTo={props.expandSendTo}
              addAttachmentResponse={props.addAttachmentResponse}
            />
          ) : (
            false
          )}

          {!props.canIPostHere && props.isRestricted === '1' ? (
            <div className="create-post create-post-restricted">
              Only administrators can post to this group.
            </div>
          ) : (
            false
          )}
        </ErrorBoundary>
      </div>
    );
  }
}
