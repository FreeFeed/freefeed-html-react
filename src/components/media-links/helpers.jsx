/* global CONFIG */
import { renderToString } from 'react-dom/server';
import { createContext, useContext, useMemo, useState } from 'react';
import { useEvent } from 'react-use-event-hook';
import {
  canShowURL as isInstagram,
  getEmbedInfo as getInstagramEmbedInfo,
} from '../link-preview/instagram';
import { getVideoInfo, getVideoType, T_VIMEO_VIDEO, T_YOUTUBE_VIDEO } from '../link-preview/video';
import { isLeftClick } from '../../utils';
import { openLightbox } from '../../services/lightbox';
import { attachmentPreviewUrl } from '../../services/api';
import { getAttachmentInfo } from '../../services/batch-attachments-info';
import { pauseYoutubeVideo, playYoutubeVideo } from './youtube-api';
import { pauseVimeoVideo, playVimeoVideo } from './vimeo-api';

export const mediaLinksContext = createContext([]);

export function useMediaLink(url) {
  const items = useContext(mediaLinksContext);
  const [mediaType, setMediaType] = useState(() => getMediaType(url));
  const index = useMemo(() => {
    const index = items.length;
    items.push(stubItem);
    createLightboxItem(url)
      .then((item) => {
        if (!item) {
          setMediaType(null);
        } else if (item.mediaType) {
          setMediaType(item.mediaType);
        }
        items[index] = item;
        return null;
      })
      .catch((err) => (items[index] = createErrorItem(err)));
    return index;
    // Items are reference-immutable, url is truly immutable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = useEvent((e) => {
    if (!mediaType || !isLeftClick(e)) {
      return;
    }
    e.preventDefault();

    // Remove empty items and modify index
    const nonEmptyItems = [];
    let newIndex = 0;
    for (const [i, item] of items.entries()) {
      if (item) {
        nonEmptyItems.push(item);
        if (i === index) {
          newIndex = nonEmptyItems.length - 1;
        }
      }
    }

    openLightbox(newIndex, nonEmptyItems);
  });
  return [mediaType, handleClick];
}

export const IMAGE = 'image';
export const VIDEO = 'video';
export const INSTAGRAM = 'instagram';

export function getMediaType(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.pathname.match(/\.(jpg|png|jpeg|webp|gif)$/i)) {
      return IMAGE;
    } else if (urlObj.pathname.match(/\.mp4$/i)) {
      return VIDEO;
    } else if (isInstagram(url)) {
      return INSTAGRAM;
    }
    return getVideoType(url);
  } catch {
    // For some URLs in user input, the 'new URL' may throw error. Just return
    // null (unknown type) in this case.
    return null;
  }
}

export const stubItem = {
  type: 'html',
  html: renderToString(
    <div className="pswp-media__container pswp-media__container--error">
      <div>Loading...</div>
    </div>,
  ),
};

export function createErrorItem(error) {
  return {
    type: 'html',
    html: renderToString(
      <div className="pswp-media__container pswp-media__container--error">
        <div className="pswp-media__error-message">${error.message}</div>
      </div>,
    ),
  };
}

const freefeedPathRegex = /^\/attachments\/(?:\w+\/)?([\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12})/;

function freefeedAttachmentId(url) {
  try {
    const urlObj = new URL(url);
    if (!CONFIG.attachmentDomains.includes(urlObj.hostname)) {
      return null;
    }
    const [, id] = freefeedPathRegex.exec(urlObj.pathname) ?? [null, null];
    return id;
  } catch {
    return null;
  }
}

async function createLightboxItem(url) {
  const attId = freefeedAttachmentId(url);
  if (attId) {
    // Freefeed attachment
    const att = await getAttachmentInfo(attId);
    if (!att) {
      return null;
    }
    if (att.meta?.inProgress) {
      // Retry after 5 seconds
      return new Promise((resolve) => setTimeout(() => resolve(createLightboxItem(url)), 5000));
    } else if (att.mediaType === 'image') {
      return {
        type: IMAGE,
        mediaType: 'image',
        src: attachmentPreviewUrl(att.id, 'image'),
        originalSrc: attachmentPreviewUrl(att.id, 'original'),
        width: att.previewWidth ?? att.width,
        height: att.previewHeight ?? att.height,
      };
    } else if (att.mediaType === 'video') {
      return {
        type: VIDEO,
        mediaType: 'video',
        videoSrc: attachmentPreviewUrl(att.id, 'video'),
        msrc: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
        originalSrc: attachmentPreviewUrl(att.id, 'original'),
        width: att.previewWidth ?? att.width,
        height: att.previewHeight ?? att.height,
        meta: att.meta ?? {},
        duration: att.duration ?? 0,
      };
    }
    return null;
  }

  const mediaType = getMediaType(url);
  if (!mediaType) {
    return null;
  }
  switch (mediaType) {
    case IMAGE:
      return {
        // Convert dropbox page URL to image URL
        src: url.replace('https://www.dropbox.com/s/', 'https://dl.dropboxusercontent.com/s/'),
        type: 'image',
        width: 1,
        height: 1,
        autoSize: true,
      };
    case VIDEO:
      return {
        videoSrc: url,
        // Empty image for placeholder
        msrc: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
        type: 'video',
        width: 1,
        height: 1,
        autoSize: true,
        meta: {},
      };
    default:
      return await getEmbeddableItem(url, mediaType);
  }
}

async function getEmbeddableItem(url, mediaType) {
  let info = null;
  if (isInstagram(url)) {
    info = getInstagramEmbedInfo(url);
  } else {
    info = await getVideoInfo(url, true);
  }

  if (!info) {
    throw new Error("Can't get embed info");
  } else if (info.error) {
    throw new Error(info.error);
  }

  if (info.mediaURL) {
    return {
      src: info.mediaURL,
      width: info.width || 1,
      height: info.height || 1,
      autoSize: !info.width || !info.height,
      type: 'image',
    };
  }

  let width = 900;
  let height = 506;
  if (info.aspectRatio) {
    if (info.aspectRatio <= 1) {
      height = Math.round(width * info.aspectRatio);
    } else {
      height = 800;
      width = Math.round(height / info.aspectRatio);
    }
  }

  let playerHTML = null;
  if (info.html) {
    playerHTML = info.html;
  } else if (info.playerURL) {
    playerHTML = renderToString(
      <iframe
        className="pswp-media__embed"
        src={info.playerURL}
        frameBorder="0"
        allowFullScreen={true}
        width={width}
        height={height}
        allow="autoplay"
      />,
    );
  } else if (info.videoURL) {
    playerHTML = renderToString(
      <video
        className="pswp-media__embed"
        src={info.videoURL}
        poster={info.previewURL}
        controls={true}
        loop={true}
      />,
    );
  }

  let onActivate = null;
  let onDeactivate = null;

  if (info.videoURL) {
    // Simple HTML5 video element play/pause
    onActivate = (element) => element.querySelector('video').play();
    onDeactivate = (element) => element.querySelector('video').pause();
  }
  if (mediaType === T_YOUTUBE_VIDEO) {
    onActivate = (element) => playYoutubeVideo(element.querySelector('iframe'));
    onDeactivate = (element) => pauseYoutubeVideo(element.querySelector('iframe'));
  }
  if (mediaType === T_VIMEO_VIDEO) {
    onActivate = (element) => playVimeoVideo(element.querySelector('iframe'));
    onDeactivate = (element) => pauseVimeoVideo(element.querySelector('iframe'));
  }

  let text = info.byline;
  if (text.length > 300) {
    text = `${text.slice(0, 200)}\u2026`;
  }
  const titleHTML = renderToString(
    <a href={url} target="_blank">
      {text || url}
    </a>,
  );
  return {
    type: 'html',
    html: `<div class="pswp-media__container">
          <div class="pswp-media__content" style="aspect-ratio: 1 / ${
            info?.aspectRatio ?? 1
          }">${playerHTML}</div>
          <div class="pswp-media__title">${titleHTML}</div>
        </div>`,
    width,
    height,
    mediaType,
    onActivate,
    onDeactivate,
  };
}
