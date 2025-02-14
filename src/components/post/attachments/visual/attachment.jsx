import cn from 'classnames';
import { useEvent } from 'react-use-event-hook';
import { faPlay, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useLayoutEffect, useRef, useState } from 'react';
import { attachmentPreviewUrl } from '../../../../services/api';
import { formatFileSize } from '../../../../utils';
import { Icon } from '../../../fontawesome-icons';
import { useMediaQuery } from '../../../hooks/media-query';
import style from './visual.module.scss';
import { NsfwCanvas } from './nsfw-canvas';
import { fitIntoBox } from './geometry';
import { useStopVideo } from './hooks';

export function VisualAttachment({
  attachment: att,
  pictureId,
  width,
  height,
  handleClick,
  removeAttachment,
  isNSFW,
}) {
  const nameAndSize = `${att.fileName} (${formatFileSize(att.fileSize)}, ${att.width}×${att.height}px)`;
  const alt = `${att.mediaType === 'image' ? 'Image' : 'Video'} attachment ${att.fileName}`;

  const { width: mediaWidth, height: mediaHeight } = fitIntoBox(att, width, height);

  const [prvWidth, setPrvWidth] = useState(mediaWidth);
  const [prvHeight, setPrvHeight] = useState(mediaHeight);

  useLayoutEffect(() => {
    // Don't update preview URLs if the size hasn't changed by more than the minimum size difference
    const minSizeDifference = 40;
    if (
      Math.abs(mediaWidth - prvWidth) < minSizeDifference &&
      Math.abs(mediaHeight - prvHeight) < minSizeDifference
    ) {
      return;
    }
    setPrvWidth(mediaWidth);
    setPrvHeight(mediaHeight);
  }, [prvWidth, prvHeight, mediaWidth, mediaHeight]);

  const hiDpi = useMediaQuery('(min-resolution: 1.5x)') ? 2 : 1;

  const handleMouseEnter = useEvent((e) => {
    e.target.play();
  });
  const handleMouseLeave = useEvent((e) => {
    e.target.pause();
    e.target.currentTime = 0;
  });
  const [currentTime, setCurrentTime] = useState(0);
  const handleTimeUpdate = useEvent((e) => setCurrentTime(Math.floor(e.target.currentTime)));

  const handleRemove = useEvent((e) => {
    e.stopPropagation();
    e.preventDefault();
    removeAttachment?.(att.id);
  });

  const imageSrc = attachmentPreviewUrl(att.id, 'image', hiDpi * prvWidth, hiDpi * prvHeight);
  const videoSrc = attachmentPreviewUrl(att.id, 'video', hiDpi * prvWidth, hiDpi * prvHeight);

  const videoRef = useRef(null);
  useStopVideo(videoRef, att.mediaType === 'video' && !att.meta?.inProgress);

  return (
    <a
      role="figure"
      className={style['link']}
      href={attachmentPreviewUrl(att.id, 'original')}
      title={nameAndSize}
      onClick={handleClick}
      target="_blank"
      data-pid={pictureId}
      style={{ width, height }}
    >
      {att.meta?.inProgress ? (
        <div className={style['processing']}>
          <Icon icon={faSpinner} className={style['processing__icon']} />
          <span>processing</span>
        </div>
      ) : (
        <>
          {/**
           * This image is used for the proper lightbox opening animation,
           * even if the attachment has 'video' type.
           */}
          <img
            id={pictureId}
            className={style['image']}
            src={imageSrc}
            alt={alt}
            loading="lazy"
            width={mediaWidth}
            height={mediaHeight}
            aria-hidden={att.mediaType === 'video'}
          />
          {att.mediaType === 'video' && (
            <>
              <video
                ref={videoRef}
                className={style['video']}
                src={videoSrc}
                poster={imageSrc}
                alt={alt}
                loading="lazy"
                width={mediaWidth}
                height={mediaHeight}
                preload="none"
                muted
                loop
                playsInline
                disablePictureInPicture
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onTimeUpdate={handleTimeUpdate}
              />
              {att.mediaType === 'video' && (
                <div className={cn(style['overlay'], style['overlay--info'])}>
                  {att.meta?.animatedImage ? <span>GIF</span> : <Icon icon={faPlay} />}
                  {formatTime(att.duration - currentTime)}
                </div>
              )}
            </>
          )}
          {isNSFW && !removeAttachment && (
            <NsfwCanvas aspectRatio={prvWidth / prvHeight} src={imageSrc} />
          )}
        </>
      )}
      {removeAttachment && (
        <button
          className={cn(style['overlay'], style['overlay--remove'], style['overlay--button'])}
          onClick={handleRemove}
        >
          <Icon icon={faTimes} />
        </button>
      )}
    </a>
  );
}

function formatTime(duration) {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration) % 60;

  return `${hours ? `${hours.toString()}:` : ''}${hours ? minutes.toString().padStart(2, '0') : minutes.toString()}:${seconds.toString().padStart(2, '0')}`;
}
