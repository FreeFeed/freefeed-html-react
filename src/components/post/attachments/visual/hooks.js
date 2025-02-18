import { useEffect, useMemo, useState } from 'react';
import { useEvent } from 'react-use-event-hook';
import { attachmentPreviewUrl } from '../../../../services/api';
import { openLightbox } from '../../../../services/lightbox';
import { handleLeftClick } from '../../../../utils';

const resizeHandlers = new Map();

const defaultWidth = process.env.NODE_ENV !== 'test' ? 0 : 600;

export function useWidthOf(elRef) {
  const [width, setWidth] = useState(elRef.current?.offsetWidth || defaultWidth);
  useEffect(() => {
    const el = elRef.current;
    resizeHandlers.set(el, setWidth);
    const observer = getResizeObserver();
    observer.observe(el);
    return () => {
      resizeHandlers.delete(el);
      observer.unobserve(el);
    };
  }, [elRef]);
  return width;
}

let _observer = null;
function getResizeObserver() {
  if (!_observer) {
    if (globalThis.ResizeObserver) {
      _observer = new globalThis.ResizeObserver((entries) => {
        for (const entry of entries) {
          resizeHandlers.get(entry.target)?.(entry.contentRect.width);
        }
      });
    } else {
      _observer = {
        observe() {},
        unobserve() {},
      };
    }
  }
  return _observer;
}

export function useLightboxItems(attachments, postId) {
  return useMemo(
    () =>
      attachments.map((a) => ({
        ...(a.mediaType === 'image'
          ? { type: 'image', src: attachmentPreviewUrl(a.id, 'image') }
          : {
              type: a.meta?.inProgress ? 'in-progress' : 'video',
              videoSrc: attachmentPreviewUrl(a.id, 'video'),
              msrc: attachmentPreviewUrl(a.id, 'image'),
              meta: a.meta ?? {},
              duration: a.duration ?? 0,
            }),
        originalSrc: attachmentPreviewUrl(a.id, 'original'),
        width: a.previewWidth ?? a.width,
        height: a.previewHeight ?? a.height,
        pid: `${postId?.slice(0, 8) ?? 'new-post'}-${a.id.slice(0, 8)}`,
      })),
    [attachments, postId],
  );
}

export function useItemClickHandler(lightboxItems) {
  return useEvent(
    handleLeftClick((e) => {
      e.preventDefault();
      const { currentTarget: el } = e;
      const index = lightboxItems.findIndex((i) => i.pid === el.dataset.pid);
      openLightbox(index, lightboxItems, el.target);
    }),
  );
}

// Prevent video from playing infinitely (we has this situation once and don't
// want it to happen again)
export function useStopVideo(videoRef, enabled) {
  useEffect(() => {
    if (!enabled || !videoRef.current) {
      return;
    }
    const videoEl = videoRef.current;

    // By default, the video playback should be paused after 5 minutes
    const defaultPlayTime = 300 * 1000;
    let maxPlayTime = Number.isFinite(videoEl.duration)
      ? videoEl.duration * 10 * 1000
      : defaultPlayTime;

    let playTimer = 0;
    const onPlay = () => {
      clearTimeout(playTimer);
      playTimer = setTimeout(() => videoEl.pause(), maxPlayTime);
    };
    const onPause = () => clearTimeout(playTimer);

    const onDurationChange = () => {
      // Video in playback mode should not be longer than 10 times of the video duration
      maxPlayTime = Math.max(defaultPlayTime, videoEl.duration * 10 * 1000);
    };
    const abortController = new AbortController();
    const { signal } = abortController;

    videoEl.addEventListener('durationchange', onDurationChange, { once: true, signal });
    videoEl.addEventListener('play', onPlay, { signal });
    videoEl.addEventListener('pause', onPause, { signal });
    signal.addEventListener('abort', onPause);
    return () => abortController.abort();
  }, [enabled, videoRef]);
}
