import cn from 'classnames';
import { useEvent } from 'react-use-event-hook';
import { faPlay, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useLayoutEffect, useState } from 'react';
import { attachmentPreviewUrl } from '../../../services/api';
import { formatFileSize } from '../../../utils';
import { Icon } from '../../fontawesome-icons';
import { useMediaQuery } from '../../hooks/media-query';
import style from './attachments.module.scss';
import { NsfwCanvas } from './nsfw-canvas';

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

  const [prvWidth, setPrvWidth] = useState(width);
  const [prvHeight, setPrvHeight] = useState(height);

  useLayoutEffect(() => {
    // Don't update preview URLs if the size hasn't changed by more than the minimum size difference
    const minSizeDifference = 40;
    if (
      Math.abs(width - prvWidth) < minSizeDifference &&
      Math.abs(height - prvHeight) < minSizeDifference
    ) {
      return;
    }
    setPrvWidth(width);
    setPrvHeight(height);
  }, [prvWidth, prvHeight, width, height]);

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

  return (
    <a
      role="figure"
      className={style['visual__link']}
      href={attachmentPreviewUrl(att.id, 'original')}
      title={nameAndSize}
      onClick={handleClick}
      target="_blank"
      data-pid={pictureId}
    >
      {/**
       * This image is used for the proper lightbox opening animation,
       * even if the attachment has 'video' type.
       */}
      <img
        id={pictureId}
        src={imageSrc}
        alt={alt}
        loading="lazy"
        width={width}
        height={height}
        aria-hidden={att.mediaType === 'video'}
      />
      {att.mediaType === 'video' && (
        <>
          <video
            className={style['visual__video']}
            src={videoSrc}
            poster={imageSrc}
            alt={alt}
            loading="lazy"
            width={width}
            height={height}
            preload="none"
            muted
            loop
            playsInline
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTimeUpdate={handleTimeUpdate}
          />
          {att.mediaType === 'video' && (
            <div className={cn(style['visual__overlay'], style['visual__overlay--info'])}>
              {att.meta?.animatedImage ? <span>GIF</span> : <Icon icon={faPlay} />}
              {formatTime(att.duration - currentTime)}
            </div>
          )}
        </>
      )}
      {isNSFW && !removeAttachment && (
        <NsfwCanvas aspectRatio={prvWidth / prvHeight} src={imageSrc} />
      )}
      {removeAttachment && (
        <button
          className={cn(
            style['visual__overlay'],
            style['visual__overlay--remove'],
            style['visual__overlay--button'],
          )}
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
