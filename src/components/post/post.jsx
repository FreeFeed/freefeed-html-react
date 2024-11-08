/* global CONFIG */
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import classnames from 'classnames';
import * as _ from 'lodash-es';
import {
  faExclamationTriangle,
  faLock,
  faUserFriends,
  faGlobeAmericas,
  faAngleDoubleRight,
  faShare,
} from '@fortawesome/free-solid-svg-icons';

import { pluralForm } from '../../utils';
import { getFirstLinkToEmbed } from '../../utils/parse-text';
import { canonicalURI } from '../../utils/canonical-uri';
import { READMORE_STYLE_COMPACT } from '../../utils/frontend-preferences-options';
import { savePost, hidePostsByCriterion, unhidePostsByCriteria } from '../../redux/action-creators';
import { initialAsyncState } from '../../redux/async-helpers';

import { Throbber } from '../throbber';
import { ButtonLink } from '../button-link';
import PieceOfText from '../piece-of-text';
import TimeDisplay from '../time-display';
import LinkPreview from '../link-preview/preview';
import ErrorBoundary from '../error-boundary';
import { Icon } from '../fontawesome-icons';
import { UserPicture } from '../user-picture';

import { prepareAsyncFocus } from '../../utils/prepare-async-focus';
import { format } from '../../utils/date-format';
import { TranslatedText } from '../translated-text';
import { existingPostURI } from '../../services/drafts';
import { Expandable } from '../expandable';
import { UnhideOptions, HideLink } from './post-hides-ui';
import PostMoreLink from './post-more-link';
import PostLikeLink from './post-like-link';
import PostHeader from './post-header';
import PostAttachments from './post-attachments';
import PostComments from './post-comments';
import PostLikes from './post-likes';
import { PostContext } from './post-context';
import { PostEditForm } from './post-edit-form';
import { PostProvider } from './post-comment-provider';
import { DraftIndicator } from './draft-indicator';

class Post extends Component {
  selectFeeds;
  hideLink = createRef();
  textareaRef = createRef();

  state = {
    forceAbsTimestamps: false,
    unHideOpened: false,
  };

  _handleUniversalComment = (text) => {
    if (this.props.isCommenting) {
      this.context.input?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      this.context.input?.focus();
      text && this.context.input?.insertText(text);
    } else {
      prepareAsyncFocus();
      (!text && this.props.toggleCommenting(this.props.id)) ||
        this.props.toggleCommenting(this.props.id, text);
    }
  };

  handleMentionAuthorClick = () => {
    const username = this.props.createdBy?.username;
    username && this._handleUniversalComment(`@${username} `);
  };

  handleCommentClick = () => {
    this._handleUniversalComment();
  };

  handleDeletePost =
    (...fromFeeds) =>
    () =>
      this.props.deletePost(this.props.id, fromFeeds);

  handleHideClick = () => {
    if (this.props.isHidden) {
      this.props.unhidePost(this.props.id);
    } else {
      this.props.hidePost(this.props.id);
    }
  };
  handleFullUnhide = () => {
    const { props } = this;
    props.isHidden && props.unhidePost(props.id);
    // Unhide all post criteria
    props.unhidePostsByCriteria(props.availableHideCriteria, props.id);
  };

  handleUnhideByCriteria = (crit) => () =>
    this.props.hidePostsByCriterion(crit, this.props.id, false);

  toggleUnHide = () => this.setState({ unHideOpened: !this.state.unHideOpened });

  toggleSave = () => {
    const { id, isSaved, savePost, savePostStatus } = this.props;
    savePostStatus.loading || savePost(id, !isSaved);
  };

  likePost = () => {
    this.props.likePost(this.props.id, this.props.user.id);
  };

  unlikePost = () => {
    this.props.unlikePost(this.props.id, this.props.user.id);
  };

  toggleModeratingComments = () => {
    this.props.toggleModeratingComments(this.props.id);
  };

  disableComments = () => {
    this.props.disableComments(this.props.id);
  };

  enableComments = () => {
    this.props.enableComments(this.props.id);
  };

  toggleEditingPost = () => {
    this.props.toggleEditingPost(this.props.id);
  };

  toggleTimestamps = () => {
    this.setState({ forceAbsTimestamps: !this.state.forceAbsTimestamps });
  };

  getPostPrivacy() {
    const authorOrGroupsRecipients = this.props.recipients.filter(
      (r) => r.id === this.props.createdBy.id || r.type === 'group',
    );
    const isPrivate = !authorOrGroupsRecipients.some((r) => r.isPrivate === '0');
    const isProtected = isPrivate || !authorOrGroupsRecipients.some((r) => r.isProtected === '0');
    return { isPrivate, isProtected };
  }

  componentWillUnmount() {
    this.hideLink.current &&
      this.props.setFinalHideLinkOffset(this.hideLink.current.getBoundingClientRect().top);
  }

  renderHideLink() {
    const { props } = this;
    return (
      <>
        <HideLink
          isHidden={props.isHidden}
          hiddenByCriteria={props.hiddenByCriteria}
          unHideOpened={this.state.unHideOpened}
          toggleUnHide={this.toggleUnHide}
          handleHideClick={this.handleHideClick}
          handleFullUnhide={this.handleFullUnhide}
        />
        {props.hideStatus.loading && (
          <span className="post-hide-throbber">
            <Throbber />
          </span>
        )}
        {props.hideStatus.error && (
          <Icon
            icon={faExclamationTriangle}
            className="post-hide-fail"
            title={props.hideStatus.errorText}
          />
        )}
      </>
    );
  }

  getAriaLabels = () => {
    const {
      isSinglePost,
      isDirect,
      recipientNames,
      createdBy,
      omittedComments,
      comments,
      likes,
      isNSFW,
      createdAt,
    } = this.props;

    const { isPrivate, isProtected } = this.getPostPrivacy();

    const role = `article${isSinglePost ? '' : ' listitem'}`;

    const postTypeLabel = isDirect
      ? 'Direct message'
      : isPrivate
        ? 'Private post'
        : isProtected
          ? 'Protected post'
          : 'Public post';

    const recipientsWithoutAuthor = recipientNames.filter((r) => r !== createdBy.username);
    const recipientsLabel =
      recipientsWithoutAuthor.length > 0
        ? `to ${recipientsWithoutAuthor.join(', ')}`
        : isDirect
          ? 'to nobody'
          : false;

    const commentsAndLikesLabel = `with ${pluralForm(
      omittedComments + comments.length,
      'comment',
    )} and ${pluralForm(likes.length, 'like')}`;

    const postLabel = [
      isNSFW ? 'Not safe for work' : false,
      postTypeLabel,
      `by ${createdBy.username}`,
      recipientsLabel,
      commentsAndLikesLabel,
      `written on ${format(new Date(+createdAt), 'MMMM do, yyyy')}`,
    ]
      .filter(Boolean)
      .join(' ');

    return { role, postLabel };
  };

  renderPostActions() {
    const { props } = this;

    const canonicalPostURI = canonicalURI(props);

    const { isPrivate, isProtected } = this.getPostPrivacy();

    const amIAuthenticated = !!props.user.id;

    const commentLink = amIAuthenticated &&
      (!props.commentsDisabled || props.isEditable || props.isModeratable) && (
        <ButtonLink className="post-action" onClick={this.handleCommentClick}>
          Comment
        </ButtonLink>
      );

    // "Like" / "Un-like"
    const didILikePost = _.find(props.usersLikedPost, { id: props.user.id });
    const likeLink =
      amIAuthenticated && !props.isEditable ? (
        <PostLikeLink
          onLikePost={this.likePost}
          onUnlikePost={this.unlikePost}
          didILikePost={didILikePost}
          likeError={props.likeError}
          isLiking={props.isLiking}
        />
      ) : (
        false
      );

    const { isSaved, savePostStatus } = this.props;
    const saveLink = amIAuthenticated && (
      <>
        <a className="post-action" onClick={this.toggleSave} role="button">
          {isSaved ? 'Un-save' : 'Save'}
        </a>
        {savePostStatus.loading && <Throbber />}
        {savePostStatus.error && (
          <Icon
            icon={faExclamationTriangle}
            className="post-like-fail"
            title={savePostStatus.errorText}
          />
        )}
      </>
    );

    // "More" menu
    const moreLink = (
      <PostMoreLink
        user={props.user}
        post={props}
        toggleEditingPost={this.toggleEditingPost}
        toggleModeratingComments={this.toggleModeratingComments}
        disableComments={this.disableComments}
        enableComments={this.enableComments}
        deletePost={this.handleDeletePost}
        toggleSave={this.toggleSave}
        handleMentionAuthor={this.handleMentionAuthorClick}
      />
    );

    return (
      <div role="region" aria-label="Post footer">
        <div className="post-footer">
          <div className="post-footer-icon">
            {isPrivate ? (
              <ButtonLink
                tag={Icon}
                icon={faLock}
                className="post-lock-icon post-private-icon"
                title="This entry is private"
                onClick={this.toggleTimestamps}
              />
            ) : isProtected ? (
              <ButtonLink
                tag={Icon}
                icon={faUserFriends}
                className="post-lock-icon post-protected-icon"
                title={`This entry is only visible to ${CONFIG.siteTitle} users`}
                onClick={this.toggleTimestamps}
              />
            ) : (
              <ButtonLink
                tag={Icon}
                icon={faGlobeAmericas}
                className="post-lock-icon post-public-icon"
                title="This entry is public"
                onClick={this.toggleTimestamps}
              />
            )}
          </div>
          <div className="post-footer-content">
            <span className="post-footer-block">
              <span className="post-footer-item">
                {props.isDirect && (
                  <Icon
                    icon={faAngleDoubleRight}
                    className="post-direct-icon"
                    title="This is a direct message"
                  />
                )}
                <Link to={canonicalPostURI} className="post-timestamp">
                  <TimeDisplay
                    timeStamp={+props.createdAt}
                    absolute={this.state.forceAbsTimestamps || null}
                  />
                </Link>
              </span>
              {props.commentsDisabled && (
                <span className="post-footer-item">
                  <i>
                    {props.isEditable || props.isModeratable
                      ? 'Comments disabled (not for you)'
                      : 'Comments disabled'}
                  </i>
                </span>
              )}
            </span>
            <span className="post-footer-block" role="region">
              <span className="post-footer-item">{commentLink}</span>
              <span className="post-footer-item">{likeLink}</span>
              <span className="post-footer-item">{saveLink}</span>
              {props.hideEnabled && (
                <span className="post-footer-item" ref={this.hideLink}>
                  {this.renderHideLink()}
                </span>
              )}
              <span className="post-footer-item">
                {!props.isEditing && (
                  <DraftIndicator
                    draftKey={existingPostURI(this.props.shortId)}
                    onClick={this.toggleEditingPost}
                  />
                )}
              </span>
              <span className="post-footer-item">{moreLink}</span>
            </span>
          </div>
        </div>
        {props.backlinksCount > 0 && (
          <div className="post-footer">
            <div className="post-footer-icon">
              <Icon icon={faShare} className="post-footer-backlink-icon" />
            </div>
            <span className="post-footer-content">
              <Link to={`${canonicalPostURI}/backlinks`}>
                {pluralForm(props.backlinksCount, 'reference')} to this post
              </Link>
            </span>
          </div>
        )}
      </div>
    );
  }

  render() {
    const { props } = this;

    const postClass = classnames({
      post: true,
      'single-post': props.isSinglePost,
      'timeline-post': !props.isSinglePost,
      'direct-post': props.isDirect,
      'nsfw-post': props.isNSFW,
    });

    const canonicalPostURI = canonicalURI(props);

    const linkToEmbed = getFirstLinkToEmbed(props.body);

    const { role, postLabel } = this.getAriaLabels();

    return (
      <PostProvider id={this.props.id}>
        <div
          className={postClass}
          data-author={props.createdBy.username}
          role={role}
          aria-label={postLabel}
        >
          <ErrorBoundary>
            <Expandable
              expanded={
                props.isEditing ||
                props.isSinglePost ||
                props.readMoreStyle === READMORE_STYLE_COMPACT ||
                !props.translateStatus.initial
              }
              panelClass={'post-expandable-panel'}
            >
              <div className="post-userpic">
                <UserPicture
                  className="post-userpic-img"
                  large={props.isSinglePost}
                  user={props.createdBy}
                />
              </div>
              <div className="post-body" role="region" aria-label="Post body">
                {props.isEditing ? (
                  <PostEditForm {...props} />
                ) : (
                  <>
                    <PostHeader
                      createdBy={props.createdBy}
                      isDirect={props.isDirect}
                      user={this.props.user}
                      isInHomeFeed={this.props.isInHomeFeed}
                      recipients={props.recipients}
                      comments={props.comments}
                      usersLikedPost={props.usersLikedPost}
                    />
                    <div className="post-text">
                      <PieceOfText
                        text={props.body}
                        readMoreStyle={props.readMoreStyle}
                        highlightTerms={props.highlightTerms}
                      />
                      <TranslatedText type="post" id={props.id} />
                    </div>
                  </>
                )}
              </div>
            </Expandable>
            {!props.isEditing && (
              <>
                {this.props.attachments.length > 0 && (
                  <div className="post-body" role="region" aria-label="Post attachments">
                    <PostAttachments
                      postId={props.id}
                      attachmentIds={this.props.attachments}
                      isEditing={false}
                      isNSFW={props.isNSFW}
                      isSinglePost={props.isSinglePost}
                      removeAttachment={this.removeAttachment}
                      reorderImageAttachments={this.reorderImageAttachments}
                    />
                    {!this.props.noImageAttachments && props.isNSFW && (
                      <div className="nsfw-bar">
                        Turn the <Link to="/settings/appearance#nsfw">NSFW filter</Link> off to
                        enable previews for sensitive content
                      </div>
                    )}
                  </div>
                )}

                {linkToEmbed && this.props.noImageAttachments && (
                  <div className="post-body">
                    {props.isNSFW ? (
                      <div className="nsfw-bar">
                        Turn the <Link to="/settings/appearance#nsfw">NSFW filter</Link> off to
                        enable previews for sensitive content
                      </div>
                    ) : (
                      <div className="link-preview" role="region" aria-label="Link preview">
                        <LinkPreview url={linkToEmbed} allowEmbedly={props.allowLinksPreview} />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="post-body">
              {this.renderPostActions()}

              {this.state.unHideOpened && (
                <UnhideOptions
                  isHidden={props.isHidden}
                  hiddenByCriteria={props.hiddenByCriteria}
                  handleUnhideByCriteria={this.handleUnhideByCriteria}
                  handleFullUnhide={this.handleFullUnhide}
                />
              )}

              <PostLikes
                post={props}
                likes={props.usersLikedPost}
                showMoreLikes={props.showMoreLikes}
              />

              <PostComments
                post={props}
                comments={props.comments}
                creatingNewComment={props.isCommenting}
                addComment={props.addComment}
                toggleCommenting={props.toggleCommenting}
                showMoreComments={props.showMoreComments}
                commentEdit={props.commentEdit}
                readMoreStyle={props.readMoreStyle}
                entryUrl={canonicalPostURI}
                highlightTerms={props.highlightTerms}
                isSinglePost={props.isSinglePost}
                forceAbsTimestamps={this.state.forceAbsTimestamps}
                user={props.user}
                preopened={props.justCreated}
              />
            </div>
          </ErrorBoundary>
        </div>
      </PostProvider>
    );
  }
}

Post.contextType = PostContext;

function selectState(state, ownProps) {
  const noImageAttachments = !ownProps.attachments.some(
    (id) => state.attachments[id]?.mediaType === 'image',
  );

  return {
    hideStatus: state.postHideStatuses[ownProps.id] || initialAsyncState,
    translateStatus: state.translationStates[`post:${ownProps.id}`] || initialAsyncState,
    submitMode: state.submitMode,
    noImageAttachments,
  };
}

export default connect(selectState, { savePost, hidePostsByCriterion, unhidePostsByCriteria })(
  Post,
);
