import cn from 'classnames';
import { useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { pluralForm } from '../../../utils';
import ErrorBoundary from '../../error-boundary';
import { GeneralAttachment } from './general';
import { AudioAttachment } from './audio';
import style from './attachments.module.scss';
import { VisualContainer } from './visual/container';

export function Attachments({
  attachmentIds,
  isNSFW,
  isExpanded,
  removeAttachment,
  reorderImageAttachments,
  postId,
}) {
  const attachments = useSelector(
    (state) => (attachmentIds || []).map((id) => state.attachments[id]).filter(Boolean),
    shallowEqual,
  );

  const [visualAttachments, audialAttachments, generalAttachments] = useMemo(() => {
    const visual = [];
    const audial = [];
    const general = [];
    for (const a of attachments) {
      if (a.mediaType === 'image' || a.mediaType === 'video') {
        visual.push(a);
      } else if (a.mediaType === 'audio') {
        audial.push(a);
      } else {
        general.push(a);
      }
    }

    return [visual, audial, general];
  }, [attachments]);

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div
      className={style['attachments']}
      role="region"
      aria-label={pluralForm(attachments.length, 'attachment')}
    >
      <ErrorBoundary>
        {visualAttachments.length > 0 && (
          <VisualContainer
            attachments={visualAttachments}
            isNSFW={isNSFW}
            isExpanded={isExpanded}
            removeAttachment={removeAttachment}
            reorderImageAttachments={reorderImageAttachments}
            postId={postId}
          />
        )}
        {audialAttachments.length > 0 && (
          <div className={cn(style['container'], style['container--audio'])}>
            {audialAttachments.map((a) => (
              <AudioAttachment key={a.id} removeAttachment={removeAttachment} attachment={a} />
            ))}
          </div>
        )}
        {generalAttachments.length > 0 && (
          <div className={cn(style['container'], style['container--general'])}>
            {generalAttachments.map((a) => (
              <GeneralAttachment key={a.id} removeAttachment={removeAttachment} attachment={a} />
            ))}
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}
