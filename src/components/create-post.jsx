import {
  faGlobeAmericas,
  faLock,
  faPaperclip,
  faUserFriends,
} from '@fortawesome/free-solid-svg-icons';
import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cn from 'classnames';
import { xor } from 'lodash-es';
import { createPost, resetPostCreateForm } from '../redux/action-creators';
import { deleteDraft, deleteEmptyDraft, getDraft, newPostURI } from '../services/drafts';
import { ButtonLink } from './button-link';
import ErrorBoundary from './error-boundary';
import { Icon } from './fontawesome-icons';
import { MoreWithTriangle } from './more-with-triangle';
import { SmartTextarea } from './smart-textarea';
import { SubmitModeHint } from './submit-mode-hint';
import { Throbber } from './throbber';
import { useFileChooser } from './uploader/file-chooser';
import { useUploader } from './uploader/uploader';
import { UploadProgress } from './uploader/progress';
import { useBool } from './hooks/bool';
import { useServerValue } from './hooks/server-info';
import { Selector } from './feeds-selector/selector';
import { CREATE_DIRECT, CREATE_REGULAR } from './feeds-selector/constants';
import { CommaAndSeparated } from './separated';
import { usePrivacyCheck } from './feeds-selector/privacy-check';
import { PreventPageLeaving } from './prevent-page-leaving';
import { Autocomplete } from './autocomplete/autocomplete';
import { Attachments } from './post/attachments/attachments';

const selectMaxFilesCount = (serverInfo) => serverInfo.attachments.maxCountPerPost;
const selectMaxPostLength = (serverInfo) => serverInfo.maxTextLength.post;

export default function CreatePost({ sendTo, isDirects }) {
  const draftKey = useSelector((state) => {
    const loc = state.routing.locationBeforeTransitions;
    return newPostURI(loc.pathname + loc.search);
  });
  const frontendPreferences = useSelector((state) => state.user.frontendPreferences);

  // Cleaning up new post draft before the first render
  useMemo(() => deleteEmptyDraft(draftKey), [draftKey]);

  const dispatch = useDispatch();
  const createPostStatus = useSelector((state) => state.createPostStatus);

  const maxFilesCount = useServerValue(selectMaxFilesCount, Infinity);
  const maxPostLength = useServerValue(selectMaxPostLength, 1e3);

  const textareaRef = useRef();

  // Local state
  const [commentsDisabled, toggleCommentsDisabled] = useBool(false);
  const [isMoreOpen, toggleIsMoreOpen] = useBool(false);
  const [postText, setPostText] = useState(
    () => getDraft(draftKey)?.text ?? (sendTo.invitation || ''),
  );

  const defaultFeedNames = useMemo(() => {
    if (Array.isArray(sendTo.defaultFeed)) {
      return sendTo.defaultFeed;
    } else if (sendTo.defaultFeed) {
      return [sendTo.defaultFeed];
    }
    return [];
  }, [sendTo.defaultFeed]);

  const [feeds, setFeeds] = useState(() => getDraft(draftKey)?.feeds ?? defaultFeedNames);

  const resetLocalState = useCallback(() => {
    toggleCommentsDisabled(false);
    toggleIsMoreOpen(false);
    setPostText(sendTo.invitation || '');
  }, [sendTo.invitation, toggleCommentsDisabled, toggleIsMoreOpen]);

  // Uploading files
  const {
    isUploading,
    fileIds,
    uploadFile,
    clearUploads,
    uploadProgressProps,
    postAttachmentsProps,
  } = useUploader({ maxCount: maxFilesCount, draftKey });

  const doChooseFiles = useFileChooser(uploadFile, { multiple: true });

  const canUploadMore = useMemo(
    () => fileIds.length < maxFilesCount,
    [fileIds.length, maxFilesCount],
  );

  const chooseFiles = useCallback(
    () => canUploadMore && doChooseFiles(),
    [canUploadMore, doChooseFiles],
  );

  const isFormDirty = useMemo(
    () => (postText.trim() !== '' || fileIds.length > 0) && !isUploading,
    [fileIds.length, isUploading, postText],
  );

  const resetForm = useCallback(() => {
    clearUploads();
    resetLocalState();
    setFeeds(defaultFeedNames);
    dispatch(resetPostCreateForm());
  }, [clearUploads, defaultFeedNames, dispatch, resetLocalState]);

  const canClearForm = useMemo(
    () => isFormDirty || !isArrayEquals(defaultFeedNames, feeds),
    [defaultFeedNames, feeds, isFormDirty],
  );

  const clearForm = useCallback(() => {
    if (canClearForm && confirm('Discard changes?')) {
      resetForm();
      deleteDraft(draftKey);
    }
  }, [canClearForm, draftKey, resetForm]);

  const [hasFeedsError, setHasFeedsError] = useState(false);

  const canSubmitForm = useMemo(() => {
    return isFormDirty && !createPostStatus.loading && feeds.length > 0 && !hasFeedsError;
  }, [createPostStatus.loading, feeds.length, hasFeedsError, isFormDirty]);

  const doCreatePost = useCallback(
    (e) => {
      e?.preventDefault?.();
      canSubmitForm &&
        dispatch(createPost(feeds, postText, fileIds, { commentsDisabled, draftKey }));
    },
    [canSubmitForm, dispatch, feeds, postText, fileIds, commentsDisabled, draftKey],
  );

  const handleCommentsDisable = useCallback(
    (e) => toggleCommentsDisabled(e.target.checked),
    [toggleCommentsDisabled],
  );

  useEffect(() => {
    // Reset form on success
    if (createPostStatus.success) {
      textareaRef.current?.blur();
      resetForm();
    }
  }, [createPostStatus.success, resetForm]);

  // Reset async status on unmount
  useEffect(() => () => dispatch(resetPostCreateForm()), [dispatch]);

  const containerRef = useRef();

  useEffect(() => {
    const h = () => Promise.all([import('react-select/creatable'), import('react-select')]);
    const el = containerRef.current;
    el.addEventListener('click', h, { once: true });
    return () => el.removeEventListener('click', h, { once: true });
  }, []);

  const [privacyLevel, privacyProblems] = usePrivacyCheck(feeds);

  const privacyIcon = useMemo(
    () =>
      privacyLevel === 'private' ? (
        <Icon icon={faLock} />
      ) : privacyLevel === 'protected' ? (
        <Icon icon={faUserFriends} />
      ) : privacyLevel === 'public' ? (
        <Icon icon={faGlobeAmericas} />
      ) : privacyLevel === 'direct' ? (
        <Icon icon={faLock} />
      ) : null,
    [privacyLevel],
  );

  const privacyTitle = useMemo(
    () =>
      privacyLevel === 'private'
        ? 'Create private post'
        : privacyLevel === 'protected'
          ? 'Create protected post'
          : privacyLevel === 'public'
            ? 'Create public post'
            : privacyLevel === 'direct'
              ? 'Create direct message'
              : null,
    [privacyLevel],
  );

  return (
    <div
      className="create-post post-editor"
      role="form"
      aria-label="Write a post"
      ref={containerRef}
    >
      <ErrorBoundary>
        <PreventPageLeaving prevent={!frontendPreferences.saveDrafts && isFormDirty} />
        <div>
          <Selector
            mode={isDirects ? CREATE_DIRECT : CREATE_REGULAR}
            feedNames={feeds}
            defaultFeedNames={defaultFeedNames}
            onChange={setFeeds}
            onError={setHasFeedsError}
            draftKey={draftKey}
          />
          <SmartTextarea
            ref={textareaRef}
            className="post-textarea"
            dragOverClassName="post-textarea__dragged"
            inactiveClassName="textarea-inactive"
            value={postText}
            defaultValue={sendTo.invitation || ''}
            onText={setPostText}
            onSubmit={doCreatePost}
            onFile={uploadFile}
            minRows={3}
            maxRows={10}
            maxLength={maxPostLength}
            dir={'auto'}
            draftKey={draftKey}
            cancelEmptyDraftOnBlur
          />
          <Autocomplete inputRef={textareaRef} />
        </div>

        <div className="post-edit-actions">
          <div className="post-edit-buttons">
            {createPostStatus.loading && (
              <span className="throbber">
                <Throbber />
              </span>
            )}
            <button
              onClick={doCreatePost}
              className={cn('btn btn-default btn-xs', !canSubmitForm && 'disabled')}
              aria-disabled={!canSubmitForm}
              title={privacyTitle}
              aria-label={privacyTitle}
            >
              <span className="post-submit-icon">{privacyIcon}</span>
              Post
            </button>
            {canClearForm && (
              <ButtonLink
                className="post-cancel"
                disabled={createPostStatus.loading}
                aria-label={createPostStatus.loading ? 'Clear disabled (submitting)' : null}
                onClick={clearForm}
              >
                Clear
              </ButtonLink>
            )}
          </div>

          <div className="post-edit-options">
            <ButtonLink
              className="post-edit-attachments"
              disabled={!canUploadMore}
              onClick={chooseFiles}
            >
              <Icon icon={faPaperclip} className="upload-icon" /> Add photos or files
            </ButtonLink>

            <ButtonLink className="post-edit-more-trigger" onClick={toggleIsMoreOpen}>
              <MoreWithTriangle />
            </ButtonLink>

            {isMoreOpen ? (
              <div className="post-edit-more">
                <label>
                  <input
                    className="post-edit-more-checkbox"
                    type="checkbox"
                    value={commentsDisabled}
                    onChange={handleCommentsDisable}
                  />
                  <span className="post-edit-more-labeltext">Comments disabled</span>
                </label>
              </div>
            ) : (
              false
            )}
          </div>

          <SubmitModeHint input={textareaRef} className="post-edit-hint" />
        </div>

        {privacyProblems.length > 0 && (
          <div className="alert alert-warning">
            You have selected a <strong>{privacyLevel}</strong> feed as a destination. This will
            make this post <strong>{privacyLevel}</strong> and ignore stricter privacy settings of{' '}
            <CommaAndSeparated>
              {privacyProblems.map((p) => (
                <strong key={p}>@{p}</strong>
              ))}
            </CommaAndSeparated>
          </div>
        )}

        {!canUploadMore && (
          <div className="alert alert-warning">
            The maximum number of attached files ({maxFilesCount}) has been reached
          </div>
        )}

        {createPostStatus.error ? (
          <div className="alert alert-danger">{createPostStatus.errorText}</div>
        ) : (
          false
        )}

        <UploadProgress {...uploadProgressProps} />
        <Attachments {...postAttachmentsProps} />
      </ErrorBoundary>
    </div>
  );
}

function isArrayEquals(a, b) {
  return xor(a, b).length === 0;
}
