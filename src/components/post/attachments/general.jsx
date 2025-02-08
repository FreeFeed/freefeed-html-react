import cn from 'classnames';
import { useEvent } from 'react-use-event-hook';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { formatFileSize, handleLeftClick } from '../../../utils';
import style from './attachments.module.scss';
import { OriginalLink } from './original-link';
import { LikeAVideo } from './like-a-video';

const videoTypes = {
  mov: 'video/quicktime',
  mp4: 'video/mp4; codecs="avc1.42E01E"',
  ogg: 'video/ogg; codecs="theora"',
  webm: 'video/webm; codecs="vp8, vorbis"',
};

const supportedVideoTypes = [];
{
  // find video-types which browser supports
  let video = document.createElement('video');
  for (const [extension, mime] of Object.entries(videoTypes)) {
    if (video.canPlayType(mime) === 'probably') {
      supportedVideoTypes.push(extension);
    }
  }
  video = null;
}

export function GeneralAttachment({ attachment: att, removeAttachment }) {
  const { inProgress = false } = att.meta ?? {};

  const handleClick = useEvent(
    handleLeftClick((e) => {
      if (this.props.meta?.inProgress) {
        e.preventDefault();
        alert('This file is still being processed');
      }
    }),
  );

  const nameAndSize = `${att.fileName} (${inProgress ? 'processing...' : formatFileSize(att.fileSize)})`;

  const extension = att.fileName.split('.').pop().toLowerCase();

  return (
    <div
      role="figure"
      aria-label={`Attachment ${nameAndSize}`}
      className={cn(style['attachment'], style['attachment--general'])}
    >
      {supportedVideoTypes.includes(extension) && <LikeAVideo attachment={att} />}
      <OriginalLink
        attachment={att}
        icon={faPaperclip}
        onClick={handleClick}
        removeAttachment={removeAttachment}
      />
    </div>
  );
}
