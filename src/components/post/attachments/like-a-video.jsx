import { useRef, useState } from 'react';
import { useEvent } from 'react-use-event-hook';
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { attachmentPreviewUrl } from '../../../services/api';
import { Icon } from '../../fontawesome-icons';
import style from './attachments.module.scss';
import { useStopVideo } from './visual/hooks';

export function LikeAVideo({ attachment: att }) {
  const [isOpened, setIsOpened] = useState(false);

  const handleOpen = useEvent(() => setIsOpened(true));

  const videoRef = useRef(null);

  useStopVideo(videoRef, isOpened);

  if (isOpened) {
    return (
      <div className={style['like-a-video']}>
        <video
          ref={videoRef}
          className={style['like-a-video__player']}
          title={att.fileName}
          autoPlay
          controls
          src={attachmentPreviewUrl(att.id, 'original')}
        />
      </div>
    );
  }

  return (
    <div className={style['like-a-video']}>
      <button
        className={style['like-a-video__button']}
        onClick={handleOpen}
        title="Click to play video"
      >
        <Icon icon={faPlayCircle} />
      </button>
    </div>
  );
}
