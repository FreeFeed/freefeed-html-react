import { useEffect, useRef, useState } from 'react';
import { faFileVideo, faPlayCircle } from '@fortawesome/free-regular-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { useEvent } from 'react-use-event-hook';
import { formatFileSize } from '../../utils';
import { ButtonLink } from '../button-link';
import { Icon } from '../fontawesome-icons';
import { attachmentPreviewUrl } from '../../services/api';

export default function LikeAVideoAttachment({
  id,
  fileName,
  fileSize,
  removeAttachment,
  isEditing,
}) {
  const url = attachmentPreviewUrl(id, 'original');
  const [isOpen, setIsOpen] = useState(false);

  const handleClickOnRemoveAttachment = useEvent(() => removeAttachment(id));
  const toggleOpen = useEvent(() => setIsOpen(true));

  const formattedFileSize = formatFileSize(fileSize);
  const title = `${fileName} (${formattedFileSize})`;

  const videoRef = useRef(null);

  // Prevent video from playing infinitely (we has this situation once and don't
  // want it to happen again)
  useEffect(() => {
    if (!isOpen || !videoRef.current) {
      return;
    }
    const videoEl = videoRef.current;

    // By default, the video playback should be paused after 5 minutes
    let maxPlayTime = 300 * 1000;
    let playTimer = 0;
    const onPlay = () => {
      clearTimeout(playTimer);
      playTimer = setTimeout(() => videoEl.pause(), maxPlayTime);
    };
    const onPause = () => clearTimeout(playTimer);
    const onDurationChange = () => {
      // Video in playback mode should not be longer than 10 times of the video duration
      maxPlayTime = videoEl.duration * 10 * 1000;
    };
    const abortController = new AbortController();
    const { signal } = abortController;

    videoEl.addEventListener('durationchange', onDurationChange, { once: true, signal });
    videoEl.addEventListener('play', onPlay, { signal });
    videoEl.addEventListener('pause', onPause, { signal });
    signal.addEventListener('abort', onPause);
    return () => abortController.abort();
  }, [isOpen]);

  return (
    <div className="attachment" role="figure" aria-label={`Video attachment ${title}`}>
      {isOpen ? (
        <div>
          <video title={title} autoPlay controls ref={videoRef}>
            <source src={url} />
            Your browser does not support HTML5 video tag.
          </video>
        </div>
      ) : (
        <ButtonLink
          onClick={toggleOpen}
          className="video-attachment-click-to-play"
          title="Click to play video"
        >
          <Icon icon={faPlayCircle} />
        </ButtonLink>
      )}
      <div>
        <a href={url} title={title} target="_blank">
          <Icon icon={faFileVideo} className="attachment-icon" />
          <span>{title}</span>
        </a>

        {isEditing && (
          <Icon
            icon={faTimes}
            className="remove-attachment"
            title="Remove video file"
            onClick={handleClickOnRemoveAttachment}
          />
        )}
      </div>
    </div>
  );
}
