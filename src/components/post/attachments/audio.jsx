import cn from 'classnames';
import { faHeadphones } from '@fortawesome/free-solid-svg-icons';
import { attachmentPreviewUrl } from '../../../services/api';
import { formatFileSize } from '../../../utils';
import style from './attachments.module.scss';
import { OriginalLink } from './original-link';

export function AudioAttachment({ attachment: att, removeAttachment }) {
  const formattedFileSize = formatFileSize(att.fileSize);

  const title =
    [att.meta?.['dc:creator'], att.meta?.['dc:relation.isPartOf'], att.meta?.['dc:title']]
      .filter(Boolean)
      .join(' – ') || att.fileName;

  const titleAndSize = `${title} (${formattedFileSize})`;

  return (
    <div
      role="figure"
      className={cn(style['attachment'], style['attachment--audio'])}
      aria-label={`Audio attachment ${titleAndSize}`}
    >
      <OriginalLink attachment={att} icon={faHeadphones} removeAttachment={removeAttachment}>
        {title}
      </OriginalLink>
      <div>
        <audio
          className={style['audio__player']}
          src={attachmentPreviewUrl(att.id, 'audio')}
          title={titleAndSize}
          preload="none"
          controls
        />
      </div>
    </div>
  );
}
