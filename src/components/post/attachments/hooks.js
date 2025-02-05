import { useEffect, useMemo, useState } from 'react';
import { useEvent } from 'react-use-event-hook';
import { attachmentPreviewUrl } from '../../../services/api';
import { openLightbox } from '../../../services/lightbox';

const resizeHandlers = new Map();

export function useWidthOf(elRef) {
  const [width, setWidth] = useState(elRef.current?.offsetWidth || 0);
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
  return useEvent((e) => {
    if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }
    e.preventDefault();
    const { currentTarget: el } = e;
    const index = lightboxItems.findIndex((i) => i.pid === el.dataset.pid);
    openLightbox(index, lightboxItems, el.target);
  });
}
