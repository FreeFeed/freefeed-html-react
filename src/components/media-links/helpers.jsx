import { renderToString } from 'react-dom/server';
import { createContext, useContext, useMemo } from 'react';
import {
  canShowURL as isInstagram,
  getEmbedInfo as getInstagramEmbedInfo,
} from '../link-preview/instagram';
import { getVideoInfo, getVideoType, T_YOUTUBE_VIDEO } from '../link-preview/video';

export const mediaLinksContext = createContext(() => () => {});

export function useMediaLink(url) {
  const registerLink = useContext(mediaLinksContext);
  const mediaType = useMemo(() => getMediaType(url), [url]);
  // Register link on component mount
  const openLink = useMemo(() => registerLink(url, mediaType), [mediaType, registerLink, url]);
  return [mediaType, openLink];
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

export async function createLightboxItem(url, mediaType) {
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
    info = await getVideoInfo(url);
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
    onActivate = function (element) {
      const iframe = element.querySelector('iframe');
      iframe.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo' }),
        'https://www.youtube.com',
      );
    };
    onDeactivate = function (element) {
      const iframe = element.querySelector('iframe');
      iframe.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'pauseVideo' }),
        'https://www.youtube.com',
      );
    };
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
