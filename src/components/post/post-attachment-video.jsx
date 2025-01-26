import { useEvent } from 'react-use-event-hook';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useRef } from 'react';
import { attachmentPreviewUrl } from '../../services/api';
import { formatFileSize } from '../../utils';
import { Icon } from '../fontawesome-icons';
import { useMediaQuery } from '../hooks/media-query';
import { videoSize } from './post-attachment-geometry';

export function VideoAttachment({ isEditing, removeAttachment, ...att }) {
  const handleClickOnRemoveAttachment = useEvent(() => removeAttachment(att.id));
  const title = `Video attachment ${att.fileName} (${formatFileSize(att.fileSize)})`;
  const { width, height } = videoSize(att);
  const hiDpi = useMediaQuery('(min-resolution: 1.5x)') ? 2 : 1;

  const videoUrl = attachmentPreviewUrl(att.id, 'video', hiDpi * width, hiDpi * height);

  const maxVideoUrl = attachmentPreviewUrl(att.id, 'video');

  const videoRef = useRef(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) {
      return;
    }
    const h = () => {
      const { paused, currentTime } = el;
      if (document.fullscreenElement) {
        el.src = maxVideoUrl;
      } else {
        el.src = videoUrl;
      }
      el.load();
      el.currentTime = currentTime;
      if (!paused) {
        el.play();
      }
    };

    el.addEventListener('fullscreenchange', h);
    return () => el.removeEventListener('fullscreenchange', h);
  }, [maxVideoUrl, videoUrl]);

  return (
    <div className="attachment attachment--video" role="figure" aria-label={title}>
      <video
        ref={videoRef}
        src={videoUrl}
        poster={attachmentPreviewUrl(att.id, 'image', hiDpi * width, hiDpi * height)}
        width={width}
        height={height}
        controls
        playsInline
        muted={att.meta?.muted}
        loop={att.meta?.animatedImage}
        loading="lazy"
      />
      {isEditing && (
        <Icon
          icon={faTimes}
          className="remove-attachment"
          title="Remove video file"
          onClick={handleClickOnRemoveAttachment}
        />
      )}
    </div>
  );
}
