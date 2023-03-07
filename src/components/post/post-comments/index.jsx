/* global CONFIG */
import { createRef, Fragment, Component } from 'react';

import { preventDefault, pluralForm, handleLeftClick } from '../../../utils';
import { safeScrollBy } from '../../../services/unscroll';
import ErrorBoundary from '../../error-boundary';
import { Icon } from '../../fontawesome-icons';
import { faCommentPlus } from '../../fontawesome-custom-icons';
import { SignInLink } from '../../sign-in-link';

import PostComment from '../post-comment';
import { prepareAsyncFocus } from '../../../utils/prepare-async-focus';
import { PostContext } from '../post-context';
import { CollapseComments } from './collapse-comments';
import ExpandComments from './expand-comments';
import { LoadingComments } from './loading-comments';
import { CommentSpacer } from './comment-spacer';

const foldConf = CONFIG.commentsFolding;

const focusTimeout = 8000;

export default class PostComments extends Component {
  static defaultProps = {
    user: {},
    commentsAfterFold: foldConf.afterFold,
    minFoldedComments: foldConf.minFolded,
    minToCollapse: foldConf.minToCollapse,
    preopened: false,
  };

  rootEl = createRef();
  visibleCommentIds = createRef([]);
  unfocusTimer = createRef(0);

  constructor(props) {
    super(props);

    this.state = {
      folded: !props.preopened,
      highlightedAuthor: null,
      highlightedCommentId: null,
      focusedCommentId: null,
    };
  }

  mentionCommentAuthor = (commentId) => {
    const name = this.props.comments.find((c) => c.id === commentId)?.user?.username;
    name && this._openAnsweringComment(`@${name}`);
  };

  backwardIdx = (commentId) => {
    const { comments } = this.props;
    const thisComment = comments.find((c) => c.id === commentId);
    if (!thisComment) {
      return 0;
    }
    const lastComment = comments[comments.length - 1];
    return lastComment.seqNumber - thisComment.seqNumber + 1;
  };

  replyWithArrows = (commentId) => {
    const bIdx = this.backwardIdx(commentId);
    const arrows = bIdx <= 4 ? '^'.repeat(bIdx) : `^${bIdx}`;
    this._openAnsweringComment(arrows);
  };

  _openAnsweringComment(answerText) {
    const { post, toggleCommenting } = this.props;

    if (!post.isCommenting && !post.isSinglePost) {
      prepareAsyncFocus();
      toggleCommenting(post.id, `${answerText} `);
    } else {
      this.context.input?.insertText(answerText);
    }
  }

  renderAddingComment() {
    const { props } = this;
    const { post } = props;

    const now = props.nowDate || new Date();
    let spacer = null;

    if (post.comments?.length > 0) {
      const lastComment = post.comments[post.comments.length - 1];
      spacer = this.renderCommentSpacer(now, lastComment.createdAt, true);
    } else {
      spacer = this.renderCommentSpacer(now, post.createdAt, true);
    }

    return (
      <Fragment key={`${props.post.id}-comment-adding`}>
        {spacer}
        <PostComment
          id={props.post.id}
          postId={props.post.id}
          isEditing={true}
          editText={props.post.newCommentText}
          saveEditingComment={props.addComment}
          toggleEditingComment={props.toggleCommenting}
          isSaving={props.post.isSavingComment}
          isSinglePost={props.post.isSinglePost}
          currentUser={props.post.user}
          isAddingComment={true}
        />
      </Fragment>
    );
  }

  renderAddCommentLink() {
    const { props } = this;
    const disabledForOthers =
      props.post.commentsDisabled && (props.post.isEditable || props.post.isModeratable);
    const toggleCommenting = props.post.isSinglePost
      ? () => {}
      : () => (prepareAsyncFocus(), props.toggleCommenting(props.post.id));

    if (props.comments.length > 2 && !props.post.omittedComments) {
      return (
        <div className="comment">
          <a
            className="comment-icon fa-stack"
            onClick={preventDefault(toggleCommenting)}
            role="button"
          >
            <Icon icon={faCommentPlus} />
          </a>
          <a className="add-comment-link" onClick={preventDefault(toggleCommenting)} role="button">
            Add comment
          </a>
          {disabledForOthers ? <i> - disabled for others</i> : false}
        </div>
      );
    }

    return false;
  }

  authorHighlightHandlers = {
    hover: (username) => this.setState({ highlightedAuthor: username }),
    leave: () => this.setState({ highlightedAuthor: null }),
  };

  arrowsHighlightHandlers = {
    hover: (baseCommentId, nArrows) => {
      const { comments } = this.props;
      const baseComment = comments.find((c) => c.id === baseCommentId);
      if (!baseComment) {
        // Comment not found
        return;
      }
      const refCommentNum = baseComment.seqNumber - nArrows;
      const refComment = comments.find((c) => c.seqNumber === refCommentNum);

      if (!refComment) {
        return;
      }

      this.setState({ highlightedCommentId: refComment.id });
    },
    leave: () => this.setState({ highlightedCommentId: null }),
  };

  canAddComment() {
    const { post } = this.props;
    return !post.commentsDisabled || post.isEditable || post.isModeratable;
  }

  setFocusedComment(/** @type {string|null} */ id) {
    this.setState({ focusedCommentId: id });
    clearTimeout(this.unfocusTimer.current);
    if (id !== null) {
      this.unfocusTimer.current = setTimeout(
        () => this.setState({ focusedCommentId: null }),
        focusTimeout,
      );
    }
  }

  onCommentLinkClick = handleLeftClick((e, commentId) => {
    if (commentId !== this.state.focusedCommentId) {
      this.setFocusedComment(commentId);
    } else {
      this.setFocusedComment(null);
      setTimeout(() => this.setFocusedComment(commentId), 0);
    }
    if (!this.visibleCommentIds.current.includes(commentId)) {
      this.expandComments();
    }
  });

  componentWillUnmount() {
    clearTimeout(this.unfocusTimer.current);
  }

  renderCommentSpacer = (from, to, isAboveCommentForm = false) => {
    if (!from || !to) {
      return null;
    }

    const { timeDifferenceForSpacer } = this.props.user?.frontendPreferences || {};

    if (!timeDifferenceForSpacer) {
      return null;
    }

    const delta = +from - +to;

    if (delta < timeDifferenceForSpacer) {
      return null;
    }

    return <CommentSpacer from={from} to={to} isAboveCommentForm={isAboveCommentForm} />;
  };

  renderComment = (comment, index = 0, array = []) => {
    const { props } = this;

    if (!comment) {
      return null;
    }

    this.visibleCommentIds.current.push(comment.id);

    let spacer = null;

    if (index > 0) {
      const previousComment = array[index - 1];
      const thisCommentDate = comment.createdAt;
      const previousCommentDate = previousComment.createdAt;

      spacer = this.renderCommentSpacer(thisCommentDate, previousCommentDate);
    }

    const postComment = (
      <PostComment
        key={comment.id}
        {...comment}
        postId={props.post.id}
        omitBubble={comment.omitBubble && !!index}
        entryUrl={props.entryUrl}
        isSinglePost={this.props.isSinglePost}
        mentionCommentAuthor={this.mentionCommentAuthor}
        replyWithArrows={this.replyWithArrows}
        backwardIdx={this.backwardIdx}
        isModeratingComments={props.post.isModeratingComments}
        {...props.commentEdit}
        authorHighlightHandlers={this.authorHighlightHandlers}
        arrowsHighlightHandlers={this.arrowsHighlightHandlers}
        showMedia={this.props.showMedia}
        readMoreStyle={props.readMoreStyle}
        highlightTerms={props.highlightTerms}
        currentUser={props.post.user}
        forceAbsTimestamps={props.forceAbsTimestamps}
        highlighted={
          comment.user?.username === this.state.highlightedAuthor ||
          comment.id === this.state.highlightedCommentId ||
          comment.id === this.state.focusedCommentId
        }
        focused={comment.id === this.state.focusedCommentId}
        canAddComment={this.canAddComment()}
        onCommentLinkClick={this.onCommentLinkClick}
      />
    );

    if (!spacer) {
      return postComment;
    }

    return (
      <Fragment key={comment.id}>
        {spacer}
        {postComment}
      </Fragment>
    );
  };

  collapseComments = () => {
    const { comments, minFoldedComments } = this.props;
    // Is there any editing comment in the fold zone?
    if (comments.slice(1, minFoldedComments + 1).some((c) => c.isEditing)) {
      alert('Please finish editing first');
      return;
    }
    this.setState({ folded: true });
  };

  expandComments = () => {
    this.setState({ folded: false });
    if (this.props.post.omittedComments > 0) {
      this.props.showMoreComments(this.props.post.id);
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.state.folded && !prevState.folded) {
      const linkEl = this.rootEl.current.querySelector('.more-comments-wrapper');
      if (!linkEl) {
        return;
      }
      const top = linkEl.getBoundingClientRect().top - 8;
      if (top < 0) {
        safeScrollBy(0, top);
      }
    }
  }

  renderAddComment() {
    const { post, user } = this.props;
    if (!this.canAddComment()) {
      return false;
    }
    if (!user.id) {
      return post.isCommenting ? (
        <div className="comment">
          <span className="comment-icon fa-stack">
            <Icon icon={faCommentPlus} />
          </span>
          <span>
            <SignInLink>Sign In</SignInLink> to add comment
          </span>
        </div>
      ) : (
        false
      );
    }
    return post.isCommenting ? this.renderAddingComment() : this.renderAddCommentLink();
  }

  render() {
    const {
      post,
      comments,
      entryUrl,
      isSinglePost,
      commentsAfterFold,
      minFoldedComments,
      minToCollapse,
    } = this.props;

    /**
     * We have three logical blocks of comments:
     * 1. The first comment;
     * 2. ExpandComments or CollapseComments element;
     * 3. The tail comments.
     *
     * Any of these blocks can be empty.
     */

    let firstComment = null;
    let foldControl = null;
    let tailComments = [];
    this.visibleCommentIds.current = [];

    if (post.omittedComments === 0) {
      // All comments are available
      if (
        isSinglePost || // Single post page or…
        !this.state.folded || // Comments are expanded by user or…
        comments.length < 1 + minFoldedComments + commentsAfterFold // There are too few comments to fold
      ) {
        if (!isSinglePost && comments.length >= minToCollapse) {
          foldControl = (
            <CollapseComments
              key="fold-link"
              onCollapse={this.collapseComments}
              commentsAfterFold={commentsAfterFold}
            />
          );
        }
        [firstComment, ...tailComments] = comments.map(this.renderComment);
      } else {
        // Too many comments, probably need to fold
        const firstEditingIdx =
          comments
            .slice(1) // Ignore the first comment editing state
            .findIndex((c) => c.isEditing) + 1;
        let firstAfterFoldIdx = comments.length - commentsAfterFold;
        if (firstEditingIdx > 0 && firstAfterFoldIdx > firstEditingIdx) {
          firstAfterFoldIdx = firstEditingIdx;
        }
        const foldedCount = firstAfterFoldIdx - 1;
        if (foldedCount < minFoldedComments) {
          // Too few comments under the fold, show them all
          if (!isSinglePost && comments.length >= minToCollapse) {
            foldControl = (
              <CollapseComments
                key="fold-link"
                onCollapse={this.collapseComments}
                commentsAfterFold={commentsAfterFold}
              />
            );
          }
          [firstComment, ...tailComments] = comments.map(this.renderComment);
        } else {
          // Folding some comments
          const foldedCommentLikes = comments
            .slice(1, firstAfterFoldIdx)
            .reduce((a, c) => a + c.likes, 0);
          foldControl = (
            <ExpandComments
              key="expand-comments"
              onExpand={this.expandComments}
              entryUrl={entryUrl}
              omittedComments={foldedCount}
              omittedCommentLikes={foldedCommentLikes}
            />
          );
          firstComment = this.renderComment(comments[0]);
          tailComments = comments.slice(firstAfterFoldIdx).map(this.renderComment);
        }
      }
    } else {
      // Some comments are not available. In this case we need to always show the fold.
      const firstEditingIdx =
        comments
          .slice(post.omittedCommentsOffset) // Ignore the first comment editing state
          .findIndex((c) => c.isEditing) + post.omittedCommentsOffset;
      let firstAfterFoldIdx = Math.max(
        post.omittedCommentsOffset,
        comments.length - commentsAfterFold,
      );
      if (firstEditingIdx >= post.omittedCommentsOffset && firstEditingIdx < firstAfterFoldIdx) {
        firstAfterFoldIdx = firstEditingIdx;
      }

      const foldedCommentLikes =
        post.omittedCommentLikes +
        comments
          .slice(post.omittedCommentsOffset, firstAfterFoldIdx)
          .reduce((a, c) => a + c.likes, 0);

      foldControl = (
        <ExpandComments
          key="expand-comments"
          onExpand={this.expandComments}
          entryUrl={entryUrl}
          omittedComments={post.omittedComments + firstAfterFoldIdx - post.omittedCommentsOffset}
          omittedCommentLikes={foldedCommentLikes}
          isLoading={post.isLoadingComments}
        />
      );
      if (post.omittedCommentsOffset > 0) {
        firstComment = this.renderComment(comments[0]);
      } else {
        firstComment = <LoadingComments key="loading-first-comment" />;
      }
      tailComments = comments.slice(firstAfterFoldIdx).map(this.renderComment);
      if (tailComments.length === 0) {
        tailComments = [<LoadingComments key="loading-tail-comments" />];
      }
    }

    const firstCommentSpacer =
      comments.length > 0 ? this.renderCommentSpacer(comments[0].createdAt, post.createdAt) : null;

    return (
      <div
        className="comments"
        ref={this.rootEl}
        role="list"
        aria-label={pluralForm(comments.length + post.omittedComments, 'comment')}
      >
        <ErrorBoundary>
          {firstCommentSpacer}
          {[firstComment, foldControl, ...tailComments]}
          {this.renderAddComment()}
        </ErrorBoundary>
      </div>
    );
  }
}

PostComments.contextType = PostContext;
