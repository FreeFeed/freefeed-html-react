import { useEvent } from 'react-use-event-hook';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { attachmentPreviewUrl } from '../../../services/api';
import { formatFileSize } from '../../../utils';
import { Icon } from '../../fontawesome-icons';
import style from './attachments.module.scss';

export function OriginalLink({
  attachment: att,
  icon,
  children = att.fileName,
  removeAttachment,
  ...props
}) {
  const { inProgress = false } = att.meta ?? {};
  const handleRemove = useEvent(() => removeAttachment?.(att.id));
  return (
    <div className={style['original-link__container']}>
      <Icon icon={icon} className={style['original-link__icon']} />
      <div className={style['original-link__text']}>
        <a
          className={style['original-link']}
          href={attachmentPreviewUrl(att.id, 'original')}
          target="_blank"
          {...props}
        >
          <span className={style['original-link__text']}>{children}</span>{' '}
          <span className={style['original-link__size']}>
            {inProgress ? 'processing...' : formatFileSize(att.fileSize)}
          </span>
        </a>
      </div>
      {removeAttachment && (
        <button className={style['original-link__remove']} onClick={handleRemove}>
          <Icon icon={faTimes} />
        </button>
      )}
    </div>
  );
}
