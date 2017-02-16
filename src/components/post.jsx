import React from 'react';
import {Link} from 'react-router';
import classnames from 'classnames';
import _ from 'lodash';
import Textarea from 'react-textarea-autosize';

import throbber16 from '../../assets/images/throbber-16.gif';
import {getFirstLinkToEmbed} from '../utils';
import PostAttachments from './post-attachments';
import PostComments from './post-comments';
import PostLikes from './post-likes';
import PostVia from './post-via';
import UserName from './user-name';
import Expandable from './expandable';
import PieceOfText from './piece-of-text';
import Dropzone from './dropzone';
import PostMoreMenu from './post-more-menu';
import TimeDisplay from './time-display';
import LinkPreview from './link-preview/preview';

export default class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      attachmentQueueLength: 0
    };
  }

  removeAttachment = (attachmentId) => this.props.removeAttachment(this.props.id, attachmentId)

  changeAttachmentQueue= (change) => () => {
    this.setState({attachmentQueueLength: this.state.attachmentQueueLength + change});
  }

  render() {
    const props = this.props;

    let editingPostText = props.editingText;
    const editingPostTextChange = (e) => {
      editingPostText = e.target.value;
    };
    const toggleEditingPost = () => props.toggleEditingPost(props.id, editingPostText);
    const cancelEditingPost = () => props.cancelEditingPost(props.id, editingPostText);
    const saveEditingPost = () => {
      if (!props.isSaving) {
        const attachmentIds = props.attachments.map(item => item.id) || [];
        props.saveEditingPost(props.id, {body: editingPostText, attachments: attachmentIds});
      }
    };
    const deletePost = () => props.deletePost(props.id);
    const likePost = () => props.likePost(props.id, props.user.id);
    const unlikePost = () => props.unlikePost(props.id, props.user.id);

    const hidePost = () => props.hidePost(props.id);
    const unhidePost = () => props.unhidePost(props.id);

    const toggleModeratingComments = () => props.toggleModeratingComments(props.id);

    const disableComments = () => props.disableComments(props.id);
    const enableComments = () => props.enableComments(props.id);

    const checkSave = (event) => {
      const isEnter = event.keyCode === 13;
      const isShiftPressed = event.shiftKey;
      if (isEnter && !isShiftPressed) {
        event.preventDefault();
        if (this.state.attachmentQueueLength === 0) {
          saveEditingPost();
        }
      }
    };
    const profilePicture = props.isSinglePost ?
      props.createdBy.profilePictureLargeUrl : props.createdBy.profilePictureMediumUrl;
    const profilePictureSize = props.isSinglePost ? 75 : 50;

    // Hidden user or group
    if (props.isInHomeFeed) {
      const hiddenUsers = props.user.frontendPreferences.homefeed.hideUsers;
      if (!_.isEmpty(hiddenUsers)) {
        const rcpNames = props.recipients.map(u => u.username);
        rcpNames.push(props.createdBy.username);
        if (!_.isEmpty(_.intersection(rcpNames, hiddenUsers))) {
          return false;
        }
      }
    }

    const postClass = classnames({
      'post': true,
      'single-post': props.isSinglePost,
      'timeline-post': !props.isSinglePost,
      'direct-post': props.isDirect
    });

    const toggleCommenting = props.isSinglePost ? () => {
    } : () => props.toggleCommenting(props.id);

    const recipientCustomDisplay = function(recipient) {
      if (recipient.id !== props.createdBy.id) {
        return false;
      }

      const lastCharacter = recipient.username[recipient.username.length - 1];
      const suffix = lastCharacter === 's' ? '\u2019 feed' : '\u2019s feed';

      return `${recipient.username}${suffix}`;
    };

    let recipients = props.recipients;
    // Check if the post has been only submitted to one recipient
    // and if we can omit it
    if (recipients.length === 1) {
      // If the post is in user/group feed (one-source list), we should omit
      // the only recipient, since it would be that feed.
      if (props.isInUserFeed) {
        recipients = [];
      } else if (recipients[0].id === props.createdBy.id) {
        // When in a many-sources list (Home, Direct messages, My discussions),
        // we should omit the only recipient if it's the author's feed.
        recipients = [];
      }
    }
    recipients = recipients.map((recipient, index) => (
      <span key={index}>
        <UserName
          className="post-recipient"
          user={recipient}
          display={recipientCustomDisplay(recipient)}/>
        {index < props.recipients.length - 2 ? ', ' : false}
        {index === props.recipients.length - 2 ? ' and ' : false}
      </span>
    ));

    // username in url
    // If posted _only_ into groups, use first recipient's username
    let urlName = props.createdBy.username;
    if (props.recipients.length > 0 && !props.recipients.some(r => r.type === "user")) {
      urlName = props.recipients[0].username;
    }

    const authorOrGroupsRecipients = props.recipients
      .filter(r => r.id === props.createdBy.id || r.type === 'group')
      .map(r => {
        // todo Remove it when we'll have garanty of isPrivate => isProtected
        if (r.isPrivate === '1') {
          r.isProtected = '1';
        }
        return r;
      });
    const isPublic = authorOrGroupsRecipients.some(r => r.isProtected === '0');
    const isProtected = !isPublic && authorOrGroupsRecipients.some(r => r.isPrivate === '0');
    const isPrivate = !isPublic && !isProtected;

    const amIAuthenticated = !!props.user.id;
    // "Comments disabled" / "Comment"
    let commentLink;
    if (amIAuthenticated) {
      if (props.commentsDisabled) {
        if (props.isEditable) {
          commentLink = (
            <span>
              {' - '}
              <i>Comments disabled (not for you)</i>
              {' - '}
              <a onClick={toggleCommenting}>Comment</a>
            </span>
          );
        } else {
          commentLink = (
            <span>
              {' - '}
              <i>Comments disabled</i>
            </span>
          );
        }
      } else {
        commentLink = (
          <span>
            {' - '}
            <a onClick={toggleCommenting}>Comment</a>
          </span>
        );
      }
    } else { // don't show comment link to anonymous users
      commentLink = false;
    }

    // "Like" / "Un-like"
    const didILikePost = _.find(props.usersLikedPost, {id: props.user.id});
    const likeLink = (amIAuthenticated && !props.isEditable ? (
      <span>
        {' - '}
        {props.likeError ? (
          <i className="fa fa-exclamation-triangle post-like-fail" title={props.likeError} aria-hidden="true"/>
        ) : null}
        <a onClick={didILikePost ? unlikePost : likePost}>{didILikePost ? 'Un-like' : 'Like'}</a>
        {props.isLiking ? (
          <span className="post-like-throbber">
            <img width="16" height="16" src={throbber16}/>
          </span>
        ) : false}
      </span>
    ) : false);

    // "Hide" / "Un-hide"
    const hideLink = (props.isInHomeFeed ? (
      <span>
        {' - '}
        <a onClick={props.isHidden ? unhidePost : hidePost}>{props.isHidden ? 'Un-hide' : 'Hide'}</a>
        {props.isHiding ? (
          <span className="post-hide-throbber">
            <img width="16" height="16" src={throbber16}/>
          </span>
        ) : false}
      </span>
    ) : false);

    // "More" menu
    const moreLink = (props.isEditable ? (
      <span>
        {' - '}
        <PostMoreMenu
          post={props}
          toggleEditingPost={toggleEditingPost}
          toggleModeratingComments={toggleModeratingComments}
          disableComments={disableComments}
          enableComments={enableComments}
          deletePost={deletePost}/>
      </span>
    ) : false);

    const linkToEmbed = getFirstLinkToEmbed(props.body);
    const noImageAttachments = !props.attachments.some(attachment => attachment.mediaType === 'image');

    const header =  (<div className="post-header">
                      <UserName className="post-author" user={props.createdBy}/>
                      {recipients.length > 0 ? ' to ' : false}
                      {recipients}
                      {this.props.isInHomeFeed ? <PostVia post={this.props} me={this.props.user} /> : false}
                    </div>);

    return (props.isRecentlyHidden ? (
      <div className="post recently-hidden-post">
        <i>Entry hidden - </i>
        <a onClick={unhidePost}>undo</a>.
        {' '}
        {props.isHiding ? (
          <span className="post-hide-throbber">
            <img width="16" height="16" src={throbber16}/>
          </span>
        ) : false}
      </div>
    ) : (
      <div className={postClass} data-author={props.createdBy.username}>
        <Expandable expanded={props.isEditing || props.isSinglePost || props.readMoreStyle === 'expandable'}
                    headerHeight={31}
                    lineHeight={20}
                    maxLines={6}
                    maxHeight={114}>
          <div className="post-userpic">
            <Link to={`/${props.createdBy.username}`}>
              <img src={profilePicture} width={profilePictureSize} height={profilePictureSize}/>
            </Link>
          </div>
          <div className="post-body">
            {header}
            {props.isEditing ? (
              <div className="post-editor">
                <Dropzone
                  addAttachmentResponse={att => props.addAttachmentResponse(this.props.id, att)}
                  addedFile={this.changeAttachmentQueue(1)}
                  removedFile={this.changeAttachmentQueue(-1)}/>

                <div>
                  <Textarea
                    className="post-textarea"
                    defaultValue={props.editingText}
                    onKeyDown={checkSave}
                    onChange={editingPostTextChange}
                    autoFocus={true}
                    minRows={2}
                    maxRows={10}
                    maxLength="1500"/>
                </div>

                <div className="post-edit-options">
                  <span className="post-edit-attachments dropzone-trigger">
                    <i className="fa fa-cloud-upload"></i>
                    {' '}
                    Add photos or files
                  </span>
                </div>

                <div className="post-edit-actions">
                  {props.isSaving ? (
                    <span className="post-edit-throbber">
                      <img width="16" height="16" src={throbber16}/>
                    </span>
                  ) : false}
                  <a className="post-cancel" onClick={cancelEditingPost}>Cancel</a>
                  <button className="btn btn-default btn-xs"
                    onClick={saveEditingPost}
                    disabled={this.state.attachmentQueueLength > 0}>Update</button>
                </div>
              </div>
            ) : (
              <div className="post-text">
                <PieceOfText  text={props.body}
                              readMoreStyle={props.readMoreStyle}
                              highlightTerms={props.highlightTerms}/>
              </div>
            )}
            </div>
          </Expandable>
          <div className="post-header-real">
            {header}
          </div>

          <div className="post-body">
          <PostAttachments
            postId={props.id}
            attachments={props.attachments}
            isEditing={props.isEditing}
            isSinglePost={props.isSinglePost}
            removeAttachment={this.removeAttachment}/>

          {noImageAttachments && linkToEmbed ? (
            <div className="link-preview"><LinkPreview url={linkToEmbed} allowEmbedly={props.allowLinksPreview} /></div>
          ) : false}

          <div className="dropzone-previews"></div>

          <div className="post-footer">
            {isPrivate ? (
              <i className="post-lock-icon fa fa-lock" title="This entry is private"/>
            ) : isProtected ? (
              <i className="post-lock-icon post-protected-icon fa fa-lock" title="This entry is only visible to FreeFeed users"/>
            ) : false}
            {props.isDirect ? (<span>»&nbsp;</span>) : false}
            <Link to={`/${urlName}/${props.id}`} className="post-timestamp">
              <TimeDisplay timeStamp={+props.createdAt}/>
            </Link>
            {commentLink}
            {likeLink}
            {hideLink}
            {moreLink}
          </div>

          {props.isError ? (
            <div className='post-error'>
              {props.errorString}
            </div>
          ) : false}

          <PostLikes
            post={props}
            likes={props.usersLikedPost}
            showMoreLikes={props.showMoreLikes}/>

          <PostComments
            post={props}
            comments={props.comments}
            creatingNewComment={props.isCommenting}
            updateCommentingText={props.updateCommentingText}
            addComment={props.addComment}
            toggleCommenting={props.toggleCommenting}
            showMoreComments={props.showMoreComments}
            commentEdit={props.commentEdit}
            readMoreStyle={props.readMoreStyle}
            entryUrl={`/${urlName}/${props.id}`}
            highlightTerms={props.highlightTerms}
            isSinglePost={props.isSinglePost}/>
        </div>
      </div>
    ));
  }
}
