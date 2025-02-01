import cn from 'classnames';
import { useEvent } from 'react-use-event-hook';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { formatFileSize } from '../../../utils';
import style from './attachments.module.scss';
import { OriginalLink } from './original-link';

export function GeneralAttachment({ attachment: att, removeAttachment }) {
  const { inProgress = false } = att.meta ?? {};

  const handleClick = useEvent((e) => {
    if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }
    if (this.props.meta?.inProgress) {
      e.preventDefault();
      alert('This file is still being processed');
    }
  });

  const nameAndSize = `${att.fileName} (${inProgress ? 'processing...' : formatFileSize(att.fileSize)})`;

  return (
    <div
      role="figure"
      aria-label={`Attachment ${nameAndSize}`}
      className={cn(style['attachment'], style['attachment--general'])}
    >
      <OriginalLink
        attachment={att}
        icon={faPaperclip}
        onClick={handleClick}
        removeAttachment={removeAttachment}
      />
    </div>
  );
}
