/* global CONFIG */
import { useMemo, useCallback, useState, useRef, useEffect, useContext } from 'react';
import cn from 'classnames';

import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { useEvent } from 'react-use-event-hook';
import { initialAsyncState } from '../redux/async-helpers';
import { doneEditingAndDeleteDraft, getDraft } from '../services/drafts';
import { attachmentPreviewUrl } from '../services/api';
import { Throbber } from './throbber';
import { ButtonLink } from './button-link';
import { Icon } from './fontawesome-icons';
import { SubmitModeHint } from './submit-mode-hint';
import { PostContext } from './post/post-context';
import { SmartTextarea } from './smart-textarea';
import { useUploader } from './uploader/uploader';
import { useFileChooser } from './uploader/file-chooser';
import { UploadProgress } from './uploader/progress';
import { PreventPageLeaving } from './prevent-page-leaving';
import { Autocomplete } from './autocomplete/autocomplete';

export function CommentEditForm({
  initialText = '',
  // Persistent form is always on page so we don't need to show Cancel button
  isPersistent = false,
  // Adding new comment form
  isAddingComment = false,
  onSubmit = () => {},
  onCancel = () => {},
  submitStatus = initialAsyncState,
  draftKey,
}) {
  const frontendPreferences = useSelector((state) => state.user.frontendPreferences);
  const { setInput } = useContext(PostContext);
  const input = useRef(null);
  const [text, setText] = useState(() => getDraft(draftKey)?.text ?? initialText);
  const canSubmit = useMemo(
    () => !submitStatus.loading && text.trim() !== '',
    [submitStatus.loading, text],
  );

  const doSubmit = useCallback(() => canSubmit && onSubmit(text), [canSubmit, onSubmit, text]);

  const isTextUpdated = useMemo(() => text.trim() !== initialText.trim(), [initialText, text]);

  const doCancel = useCallback(
    (e) => {
      if (isTextUpdated && !confirm('Discard changes?')) {
        return;
      }
      if (isPersistent) {
        setText(initialText);
      }
      onCancel(e);
      doneEditingAndDeleteDraft(draftKey);
    },
    [isTextUpdated, draftKey, initialText, isPersistent, onCancel],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSubmit = useCallback(
    // Need to setText to update text that doSubmit can access
    () => (setText(text), doSubmit()),
    [doSubmit, text],
  );

  // On first focus move cursor to the end of text
  const wasFocused = useRef(false);
  const onFocus = useCallback(() => {
    if (!wasFocused.current) {
      wasFocused.current = true;
      input.current.setSelectionRange(input.current.value.length, input.current.value.length);
    }
  }, []);

  // Auto-focus dynamically added form
  useEffect(() => void (isPersistent || input.current.focus()), [isPersistent]);

  // Clean text after the persistent form submit
  const wasSubmitted = useRef(false);
  useEffect(() => {
    if (submitStatus.loading) {
      wasSubmitted.current = true;
    }
    if (isPersistent && submitStatus.initial && wasSubmitted.current) {
      setText('');
      wasSubmitted.current = false;
      input.current.blur();
    }
  }, [draftKey, isPersistent, submitStatus.initial, submitStatus.loading]);

  // Set input context if persistent form
  useEffect(() => {
    if (isAddingComment) {
      setInput(input.current);
    }
  }, [setInput, isAddingComment]);

  // Uploading files
  const onUpload = useEvent((att) => {
    const inProgress = att.meta?.inProgress;
    const previewType = inProgress || att.mediaType === 'general' ? 'original' : att.mediaType;
    const url = attachmentPreviewUrl(att.id, previewType, null, null, false);
    fetch(url)
      .then((r) => r.json())
      .then(({ url }) => {
        if (inProgress) {
          url = url.replace('.tmp', '.mp4');
        }
        input.current?.insertText(url);
        return null;
      })
      .catch((e) => alert(`Upload error: ${e.message}`));
  });

  const { isUploading, uploadFile, uploadProgressProps } = useUploader({ onSuccess: onUpload });
  const chooseFiles = useFileChooser(uploadFile, { multiple: true });

  const disabled = !canSubmit || submitStatus.loading || isUploading;

  return (
    <div className="comment-body" role="form">
      <PreventPageLeaving
        prevent={!frontendPreferences.saveDrafts && (canSubmit || submitStatus.loading)}
      />
      <div>
        <SmartTextarea
          ref={input}
          className="comment-textarea"
          dragOverClassName="comment-textarea__dragged"
          inactiveClassName="textarea-inactive"
          value={text}
          defaultValue={initialText}
          onFocus={onFocus}
          onText={setText}
          onFile={uploadFile}
          onSubmit={handleSubmit}
          minRows={2}
          maxRows={10}
          maxLength={CONFIG.maxLength.comment}
          readOnly={submitStatus.loading}
          dir={'auto'}
          draftKey={draftKey}
          cancelEmptyDraftOnBlur={isPersistent}
        />
        <Autocomplete inputRef={input} context="comment" />
      </div>
      <div>
        <button
          className={cn('btn btn-default btn-xs comment-post', {
            disabled,
          })}
          aria-disabled={disabled}
          aria-label={
            !canSubmit
              ? 'Submit disabled (textarea is empty)'
              : submitStatus.loading
                ? 'Submitting comment'
                : null
          }
          onClick={doSubmit}
        >
          Comment
        </button>

        {(!isPersistent || isTextUpdated) && (
          <ButtonLink
            className="comment-cancel"
            onClick={doCancel}
            disabled={submitStatus.loading}
            aria-label={submitStatus.loading ? 'Cancel disabled (submitting)' : null}
          >
            {isPersistent ? 'Clear' : 'Cancel'}
          </ButtonLink>
        )}

        <SubmitModeHint input={input} />

        <ButtonLink
          className="comment-file-button iconic-button"
          title="Add photo or file"
          onClick={chooseFiles}
        >
          <Icon icon={faPaperclip} />
        </ButtonLink>

        {submitStatus.loading && <Throbber className="comment-throbber" />}
        {submitStatus.error && <span className="comment-error">{submitStatus.errorText}</span>}
      </div>
      <UploadProgress {...uploadProgressProps} />
    </div>
  );
}
