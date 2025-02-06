/* global describe, it, expect, vi */
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createStore } from 'redux';
import * as reactRedux from 'react-redux';
import { beforeEach } from 'vitest';
import * as actionCreators from '../../src/redux/action-creators';

vi.mock('../../src/components/post/post-comments', () => ({
  default: ({ comments }) => {
    return <div>{comments.length > 0 ? `Mocked ${comments.length} comments ` : ''}</div>;
  },
}));

vi.mock('../../src/components/post/attachments/attachments', () => ({
  Attachments: ({ attachmentIds }) => {
    return (
      <div>{attachmentIds.length > 0 ? `Mocked ${attachmentIds.length} attachments` : ''}</div>
    );
  },
}));

// https://github.com/facebook/jest/issues/8769#issuecomment-812824244
vi.mock('../../src/components/lazy-component', () => ({
  lazyComponent:
    (loader, { fallback, errorMessage }) =>
    () => {
      return <div>{fallback || errorMessage}</div>;
    },
}));

import Post from '../../src/components/post/post';
import { initialAsyncState } from '../../src/redux/async-helpers';
import { deleteDraft, existingPostURI } from '../../src/services/drafts';

const AUTHOR = {
  id: 'author-id',
  username: 'author',
  screenName: 'Author',
  type: 'user',
  isPrivate: '0',
  isProtected: '0',
};

const VIEWER = {
  ...AUTHOR,
  frontendPreferences: {
    timeDisplay: {},
  },
};

const defaultState = {
  user: { ...VIEWER, subscriptions: [] },
  postHideStatuses: {},
  saveEditingPostStatuses: {},
  submitMode: 'enter',
  serverInfoStatus: initialAsyncState,
  users: { [AUTHOR.id]: AUTHOR },
  usersNotFound: [],
  attachments: {
    a1: { id: 'a1', mediaType: 'image' },
    a2: { id: 'a2' },
  },
  translationStates: {},
  translationResults: {},
  posts: {},
};

const renderPost = (props = {}, options = {}) => {
  const { Provider } = reactRedux;
  const dummyReducer = (state) => state;
  const store = createStore(dummyReducer, {
    ...defaultState,
    posts: { 'post-id': { id: 'post-id', shortId: 'post-id' } },
    submitMode: options.submitMode || 'enter',
  });

  const defaultProps = {
    id: 'post-id',
    shortId: 'post-id',
    body: 'Line 1\nLine 2',
    createdAt: '1615692239035',
    updatedAt: '1615692257002',
    comments: [],
    attachments: [],
    likes: [],
    createdBy: AUTHOR,
    recipients: [AUTHOR],
    recipientNames: [AUTHOR.username],
    isSinglePost: true,
    isDirect: false,
    isNSFW: false,
    commentsDisabled: false,
    commentLikes: 0,
    ownCommentLikes: 0,
    omittedCommentLikes: 0,
    omittedOwnCommentLikes: 0,
    omittedComments: 0,
    omittedLikes: 0,
    usersLikedPost: [],
    user: VIEWER,
    savePostStatus: {},
    hideStatus: {},
    setFinalHideLinkOffset: () => {},
    toggleEditingPost: () => {},
    saveEditingPost: () => {},
  };

  const rendered = render(
    <Provider store={store}>
      <Post {...defaultProps} {...props} />
    </Provider>,
    options,
  );

  return {
    ...rendered,
    rerender: (props = {}, options = {}) =>
      renderPost(props, { container: rendered.container, ...options }),
  };
};

describe('Post', () => {
  it("Renders a post and doesn't blow up", () => {
    const { asFragment } = renderPost();
    expect(asFragment()).toMatchSnapshot();
  });

  it('Displays all post recipients', () => {
    const someOtherGuy = {
      id: 'other-guy-id',
      username: 'otherguy1',
      screenName: 'Other Guy',
      type: 'user',
    };
    const someOtherGroup = {
      id: 'other-group-id',
      username: 'othergroup',
      screenName: 'Other Group',
      type: 'group',
    };
    renderPost({
      recipients: [AUTHOR, someOtherGuy, someOtherGroup],
      recipientNames: [AUTHOR.username, someOtherGuy.username, someOtherGroup.username],
    });
    expect(screen.getByLabelText('Post body')).toHaveTextContent(
      'You to author’s feed, Other Guy and Other Group',
    );
  });

  it('Displays post likes', () => {
    renderPost({
      likes: ['u1', 'u2', 'u3'],
      usersLikedPost: [
        { id: 'u1', username: 'user1', screenName: 'User 1' },
        { id: 'u2', username: 'user2', screenName: 'User 2' },
        { id: 'u3', username: 'user3', screenName: 'User 3' },
      ],
    });
    expect(screen.getByLabelText('3 likes')).toHaveTextContent(
      'User 1, User 2 and User 3 liked this',
    );
  });

  it('Displays post comments', () => {
    renderPost({
      comments: [{ id: 'c1' }, { id: 'c2' }],
    });
    expect(screen.getByText(/Mocked 2 comments/)).toBeInTheDocument();
  });

  it('Displays post attachments', () => {
    renderPost({
      attachments: ['a1', 'a2'],
    });
    expect(screen.getByText('Mocked 2 attachments')).toBeInTheDocument();
  });

  it('Displays NSFW warning for a NSFW post with image attachments', () => {
    renderPost({
      isNSFW: true,
      attachments: ['a1', 'a2'],
    });
    expect(screen.getByLabelText(/Not safe for work Public post/)).toHaveTextContent(
      /Turn the NSFW filter off to enable previews for sensitive content/,
    );
  });

  it('Displays NSFW warning for a NSFW post with a link embed', () => {
    renderPost({
      isNSFW: true,
      body: 'embed https://example.com/',
    });
    expect(screen.getByLabelText(/Not safe for work Public post/)).toHaveTextContent(
      /Turn the NSFW filter off to enable previews for sensitive content/,
    );
  });

  it('Displays a link embed for a normal post with a link embed', () => {
    renderPost({
      body: 'embed https://example.com/',
      allowLinksPreview: false,
    });
    expect(screen.getByLabelText(/Link preview/)).toBeInTheDocument();
  });

  it('Renders a post as public and toggles timestamps if post visibility icon is clicked', async () => {
    renderPost();
    expect(screen.getByLabelText(/Public post/)).toBeInTheDocument();
    expect(screen.getByTitle(/This entry is public/, { role: 'button' })).toBeInTheDocument();
    expect(screen.getByText('Mar 14, 2021')).toBeInTheDocument();
    await userEvent.click(screen.getByTitle(/This entry is public/, { role: 'button' }));
    expect(screen.getByText('Mar 14, 2021 03:23')).toBeInTheDocument();
  });

  it('Renders a post as protected because its author is protected', () => {
    const protectedAuthor = {
      ...AUTHOR,
      isProtected: '1',
    };
    renderPost({
      recipients: [protectedAuthor],
      createdBy: protectedAuthor,
    });
    expect(screen.getByLabelText(/Protected post/)).toBeInTheDocument();
    expect(screen.getByTitle(/This entry is only visible to FreeFeed users/)).toBeInTheDocument();
  });

  it('Renders a post as protected because all of its recipients are protected', () => {
    const protectedGroup = {
      id: 'pg1',
      username: 'protected-group',
      type: 'group',
      isProtected: '1',
    };
    const protectedAuthor = {
      ...AUTHOR,
      isProtected: '1',
    };
    renderPost({
      recipients: [protectedAuthor, protectedGroup],
      createdBy: protectedAuthor,
    });
    expect(screen.getByLabelText(/Protected post/)).toBeInTheDocument();
    expect(screen.getByTitle(/This entry is only visible to FreeFeed users/)).toBeInTheDocument();
  });

  it('Renders a post as private because its author is private', () => {
    const privateAuthor = {
      ...AUTHOR,
      isPrivate: '1',
    };
    renderPost({
      recipients: [privateAuthor],
      createdBy: privateAuthor,
    });
    expect(screen.getByLabelText(/Private post/)).toBeInTheDocument();
    expect(screen.getByTitle(/This entry is private/)).toBeInTheDocument();
  });

  it('Renders a post as a direct message', () => {
    renderPost({
      isDirect: true,
    });
    expect(screen.getByLabelText(/Direct message/)).toBeInTheDocument();
    expect(screen.getByTitle(/This is a direct message/)).toBeInTheDocument();
  });

  it('Renders a comment button which opens the comment form if this is not a single post', async () => {
    const toggleCommenting = vi.fn();
    renderPost({ toggleCommenting, isSinglePost: false });
    expect(screen.getByText('Comment', { role: 'button' })).toBeInTheDocument();
    await userEvent.click(screen.getByText('Comment', { role: 'button' }));
    expect(toggleCommenting).toHaveBeenCalledWith('post-id');
  });

  it("Doesn't render a comment button if comments are disabled", () => {
    renderPost({ commentsDisabled: true });
    expect(screen.queryByText('Comment', { role: 'button' })).not.toBeInTheDocument();
    expect(screen.getByText('Comments disabled')).toBeInTheDocument();
  });

  it('Renders a comment button if comments are disabled but you are the moderator/owner', () => {
    renderPost({ commentsDisabled: true, isEditable: true });
    expect(screen.getByText('Comment', { role: 'button' })).toBeInTheDocument();
    expect(screen.getByText('Comments disabled (not for you)')).toBeInTheDocument();
  });

  it('Renders a like button which likes the post', async () => {
    const someOtherUser = { id: 'other-id' };
    const likePost = vi.fn();
    renderPost({ likePost, isEditable: false, user: someOtherUser });
    expect(screen.getByText('Like', { role: 'button' })).toBeInTheDocument();
    await userEvent.click(screen.getByText('Like', { role: 'button' }));
    expect(likePost).toHaveBeenCalledWith('post-id', 'other-id');
  });

  it('Renders an un-like button which un-likes the post if this post is already liked', async () => {
    const someOtherUser = { id: 'other-id' };
    const unlikePost = vi.fn();
    renderPost({
      unlikePost,
      isEditable: false,
      usersLikedPost: [someOtherUser],
      user: someOtherUser,
    });
    expect(screen.getByText('Un-like', { role: 'button' })).toBeInTheDocument();
    await userEvent.click(screen.getByText('Un-like', { role: 'button' }));
    expect(unlikePost).toHaveBeenCalledWith('post-id', 'other-id');
  });

  it("Doesn't render a like/unlike button if this is a post that I can edit (e.g. my own post)", () => {
    renderPost({ isEditable: true });
    expect(screen.queryByText('Like', { role: 'button' })).not.toBeInTheDocument();
    expect(screen.queryByText('Un-like', { role: 'button' })).not.toBeInTheDocument();
  });

  it('Renders a more button if this is a post that I can edit (e.g. my own post) which toggles a "more action" menu', async () => {
    const confirmMock = vi.spyOn(global, 'confirm').mockReturnValueOnce(true);

    const toggleEditingPost = vi.fn();
    const toggleModeratingComments = vi.fn();
    const disableComments = vi.fn();
    const deletePost = vi.fn();
    renderPost({
      isEditable: true,
      isModeratable: true,
      isDeletable: true,
      toggleEditingPost,
      toggleModeratingComments,
      disableComments,
      deletePost,
    });
    expect(screen.getByText(/More/, { role: 'button' })).toBeInTheDocument();

    await userEvent.click(screen.getByText(/More/, { role: 'button' }));
    expect(screen.getByText('Edit', { role: 'button' })).toBeInTheDocument();
    await userEvent.click(screen.getByText('Edit', { role: 'button' }));
    expect(toggleEditingPost).toHaveBeenCalledWith('post-id');

    await userEvent.click(screen.getByText(/More/, { role: 'button' }));
    expect(screen.getByText('Moderate comments', { role: 'button' })).toBeInTheDocument();
    await userEvent.click(screen.getByText('Moderate comments', { role: 'button' }));
    expect(toggleModeratingComments).toHaveBeenCalledWith('post-id');

    await userEvent.click(screen.getByText(/More/, { role: 'button' }));
    expect(screen.getByText('Disable comments', { role: 'button' })).toBeInTheDocument();
    await userEvent.click(screen.getByText('Disable comments', { role: 'button' }));
    expect(disableComments).toHaveBeenCalledWith('post-id');

    await userEvent.click(screen.getByText(/More/, { role: 'button' }));
    expect(screen.getByText('Delete', { role: 'button' })).toBeInTheDocument();
    await userEvent.click(screen.getByText('Delete', { role: 'button' }));
    expect(confirmMock).toHaveBeenCalledWith('Are you sure?');
    expect(deletePost).toHaveBeenCalledWith('post-id', []);
  });

  it('Renders a more button if this is a post that I can moderati (e.g. post in my groups) which toggles a "more action" menu', async () => {
    const confirmMock = vi.spyOn(global, 'confirm').mockReturnValueOnce(true);

    const toggleEditingPost = vi.fn();
    const toggleModeratingComments = vi.fn();
    const disableComments = vi.fn();
    const deletePost = vi.fn();
    renderPost({
      isEditable: false,
      isModeratable: true,
      isDeletable: false,
      canBeRemovedFrom: ['celestials'],
      toggleEditingPost,
      toggleModeratingComments,
      disableComments,
      deletePost,
    });
    expect(screen.getByText(/More/, { role: 'button' })).toBeInTheDocument();
    await userEvent.click(screen.getByText(/More/, { role: 'button' }));

    expect(screen.getByText('Remove from @celestials', { role: 'button' })).toBeInTheDocument();
    await userEvent.click(screen.getByText(/Remove/, { role: 'button' }));
    expect(confirmMock).toHaveBeenCalledWith('Are you sure?');
    expect(deletePost).toHaveBeenCalledWith('post-id', ['celestials']);
  });

  it('Lets me enable comments under my post if they are disabled', async () => {
    const enableComments = vi.fn();
    renderPost({
      isEditable: true,
      commentsDisabled: true,
      enableComments,
    });
    expect(screen.getByText(/More/, { role: 'button' })).toBeInTheDocument();
    await userEvent.click(screen.getByText(/More/, { role: 'button' }));

    expect(screen.getByText('Enable comments', { role: 'button' })).toBeInTheDocument();
    await userEvent.click(screen.getByText('Enable comments', { role: 'button' }));
    expect(enableComments).toHaveBeenCalledWith('post-id');
  });

  it('Renders a hide button which hides the post', async () => {
    const someOtherUser = { id: 'other-id' };
    const hidePost = vi.fn();
    renderPost({
      user: someOtherUser,
      isInHomeFeed: true,
      hideEnabled: true,
      isHidden: false,
      hidePost,
    });
    expect(screen.getByText('Hide', { role: 'button' })).toBeInTheDocument();
    await userEvent.click(screen.getByText('Hide', { role: 'button' }));
    expect(hidePost).toHaveBeenCalledWith('post-id');
  });

  it('Renders a un-hide button which unhides the post', async () => {
    const someOtherUser = { id: 'other-id' };
    const unhidePost = vi.fn();
    renderPost({
      user: someOtherUser,
      isInHomeFeed: true,
      hideEnabled: true,
      isHidden: true,
      hiddenByNames: false,
      unhidePost,
    });
    expect(screen.getByText('Un-hide', { role: 'button' })).toBeInTheDocument();
    await userEvent.click(screen.getByText('Un-hide', { role: 'button' }));
    expect(unhidePost).toHaveBeenCalledWith('post-id');
  });

  it('Renders a textarea with post text when editing the post', async () => {
    const cancelEditingPost = vi.spyOn(actionCreators, 'cancelEditingPost');
    const { rerender } = renderPost({ isEditable: true });

    await userEvent.click(screen.getByText(/More/, { role: 'button' }));
    await userEvent.click(screen.getByText('Edit', { role: 'button' }));
    rerender({ isEditing: true, isEditable: true });

    expect(screen.getByLabelText('Post body')).toMatchSnapshot();

    await userEvent.click(screen.getByText('Cancel'));
    expect(cancelEditingPost).toHaveBeenCalledWith('post-id');
  });

  describe('Post text editing', () => {
    beforeEach(() => {
      deleteDraft(existingPostURI('post-id'));
    });

    it('Lets me edit text of my post by typing with Shift+Enter when "submitMode" is "enter"', async () => {
      const saveEditingPost = vi.spyOn(actionCreators, 'saveEditingPost');
      renderPost({
        isEditing: true,
        isEditable: true,
        body: '',
      });

      await userEvent.type(
        screen.getByRole('textbox'),
        'Hello,{shift>}{enter}{/shift}World!{enter}',
      );
      expect(screen.getByRole('textbox')).toHaveValue('Hello,\nWorld!');
      expect(saveEditingPost).toHaveBeenCalledWith('post-id', {
        attachments: [],
        body: 'Hello,\nWorld!',
        feeds: ['author'],
        draftKey: existingPostURI('post-id'),
      });
    });

    it('Lets me edit text of my post by typing with Alt+Enter when "submitMode" is "enter"', async () => {
      const saveEditingPost = vi.spyOn(actionCreators, 'saveEditingPost');
      renderPost({
        isEditing: true,
        isEditable: true,
        body: '',
      });

      await userEvent.type(screen.getByRole('textbox'), 'Hello,{alt>}{enter}{/alt}World!{enter}');
      expect(screen.getByRole('textbox')).toHaveValue('Hello,\nWorld!');
      expect(saveEditingPost).toHaveBeenCalledWith('post-id', {
        attachments: [],
        body: 'Hello,\nWorld!',
        feeds: ['author'],
        draftKey: existingPostURI('post-id'),
      });
    });

    it('Lets me submit text of my post by Ctrl+Enter typing when "submitMode" is "ctrl+enter"', async () => {
      const saveEditingPost = vi.spyOn(actionCreators, 'saveEditingPost');
      renderPost(
        {
          isEditing: true,
          isEditable: true,
          body: '',
        },
        { submitMode: 'ctrl+enter' },
      );

      await userEvent.type(
        screen.getByRole('textbox'),
        'Hello,{enter}World!{control>}{enter}{/control}',
      );
      expect(screen.getByRole('textbox')).toHaveValue('Hello,\nWorld!');
      expect(saveEditingPost).toHaveBeenCalledWith('post-id', {
        attachments: [],
        body: 'Hello,\nWorld!',
        feeds: ['author'],
        draftKey: existingPostURI('post-id'),
      });
    });

    it('Lets me submit text of my post by Meta+Enter typing when "submitMode" is "ctrl+enter"', async () => {
      const saveEditingPost = vi.spyOn(actionCreators, 'saveEditingPost');
      renderPost(
        {
          isEditing: true,
          isEditable: true,
          body: '',
        },
        { submitMode: 'ctrl+enter' },
      );

      await userEvent.type(screen.getByRole('textbox'), 'Hello,{enter}World!{meta>}{enter}{/meta}');
      expect(screen.getByRole('textbox')).toHaveValue('Hello,\nWorld!');
      expect(saveEditingPost).toHaveBeenCalledWith('post-id', {
        attachments: [],
        body: 'Hello,\nWorld!',
        feeds: ['author'],
        draftKey: existingPostURI('post-id'),
      });
    });
  });
});
