/* global CONFIG */
import { parse as urlParse } from 'url';
import { parse as queryParse } from 'querystring';

import { useState, useEffect, useMemo, memo } from 'react';
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { useEvent } from 'react-use-event-hook';

import { Icon } from '../fontawesome-icons';
import { apiVersion } from '../../services/api-version';
import cachedFetch from './helpers/cached-fetch';
import * as aspectRatio from './helpers/size-cache';

const YOUTUBE_VIDEO_RE =
  /^https?:\/\/(?:www\.|m\.|music\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|shorts\/|v\/|watch\?(?:v=|.+&v=)))([\w-]+)/i;
const YOUTUBE_PLAYLIST_RE =
  /^https?:\/\/(?:www\.|m\.|music\.)?(?:youtu\.be\/|youtube\.com\/)playlist\?list=([\w-]+)/i;

const VIMEO_VIDEO_RE = /^https?:\/\/vimeo\.com\/(?:ondemand\/[^/]+\/)?(\d+)(?:\/([a-z\d]+))?/i;
const COUB_VIDEO_RE = /^https?:\/\/coub\.com\/view\/([a-z\d]+)/i;
const IMGUR_VIDEO_RE = /^https?:\/\/i\.imgur\.com\/([a-z\d]+)\.(gifv|mp4)/i;
const GFYCAT_RE =
  /^https?:\/\/(?:[a-z]+\.)?gfycat\.com\/(?:[^/]{0,3}\/)?((?:[A-Z][a-z]+){3}|[a-z]{16,})/;
const GIPHY_RE = /^https?:\/\/giphy.com\/gifs\/.+?-([a-zA-Z\d]+)($|\/|\?)/;
const APARAT_RE = /^https:\/\/?(?:www\.)?aparat\.com\/v\/([^/]+)/i;

export const T_YOUTUBE_VIDEO = 'T_YOUTUBE_VIDEO';
export const T_VIMEO_VIDEO = 'T_VIMEO_VIDEO';
export const T_COUB_VIDEO = 'T_COUB_VIDEO';
export const T_IMGUR_VIDEO = 'T_IMGUR_VIDEO';
export const T_GFYCAT = 'T_GFYCAT';
export const T_GIPHY = 'T_GIPHY';
export const T_APARAT = 'T_APARAT';

const apiPrefix = `${CONFIG.api.root}/v${apiVersion}`;

export function canShowURL(url) {
  return getVideoType(url) !== null;
}

export default memo(function VideoPreview({ url }) {
  const [info, setInfo] = useState(null);
  const [playerVisible, setPlayerVisible] = useState(false);

  const feedIsLoading = useSelector((state) => state.routeLoadingState);

  const [
    // CSS style of video preview
    previewStyle,
    // Video width
    width,
    // Can we show player? (metadata is loaded and we can play video)
    canShowPlayer,
    // Can we hide player?
    canHidePlayer,
    // Player code
    player,
  ] = useMemo(() => {
    const previewStyle = info ? { backgroundImage: `url(${info.previewURL})` } : {};

    // video will have the same area as 16x9 450px-width rectangle
    const r = info ? info.aspectRatio : aspectRatio.get(url, getDefaultAspectRatio(url));
    const width = 450 * Math.sqrt(9 / 16 / r);
    previewStyle.paddingBottom = `${100 * r}%`;

    const canShowPlayer = info && (info.videoURL || info.playerURL || info.html);
    const canHidePlayer = info && info.videoURL;

    let player = null;
    if (canShowPlayer) {
      if (info.html) {
        // eslint-disable-next-line react/no-danger
        player = <div dangerouslySetInnerHTML={{ __html: info.html }} />;
      } else if (info.playerURL) {
        player = (
          <iframe
            src={info.playerURL}
            frameBorder="0"
            allowFullScreen={true}
            allow="autoplay"
            aria-label="Video player"
          />
        );
      } else {
        player = (
          <video
            src={info.videoURL}
            poster={info.previewURL}
            autoPlay={true}
            loop={true}
            aria-label="Video player"
          />
        );
      }
    }

    return [previewStyle, width, canShowPlayer, canHidePlayer, player];
  }, [info, url]);

  const togglePlayer = useEvent(() =>
    setPlayerVisible((visible) => {
      if (visible && canHidePlayer) {
        return false;
      } else if (!visible && canShowPlayer) {
        return true;
      }
      return visible;
    }),
  );

  // Load video info
  useEffect(() => void getVideoInfo(url).then(setInfo), [url]);

  // Turn player off is feed is loading
  useEffect(
    () => setPlayerVisible(playerVisible && !feedIsLoading),
    [playerVisible, feedIsLoading],
  );

  if (info && 'error' in info) {
    return <div className="video-preview link-preview-content load-error">{info.error}</div>;
  }

  return (
    <div className="video-preview link-preview-content" style={{ maxWidth: width }}>
      <div
        className="static-preview"
        style={previewStyle}
        onClick={togglePlayer}
        aria-label="Video preview"
      >
        {player && (playerVisible ? player : <Icon icon={faPlayCircle} className="play-icon" />)}
      </div>
      <div className="info">
        <a href={url} target="_blank" title={info?.byline}>
          {info ? info.byline : 'Loading…'}
        </a>
      </div>
    </div>
  );
});

// Helpers

export function getVideoType(url) {
  if (YOUTUBE_VIDEO_RE.test(url) || YOUTUBE_PLAYLIST_RE.test(url)) {
    return T_YOUTUBE_VIDEO;
  }
  if (VIMEO_VIDEO_RE.test(url)) {
    return T_VIMEO_VIDEO;
  }
  if (COUB_VIDEO_RE.test(url)) {
    return T_COUB_VIDEO;
  }
  if (IMGUR_VIDEO_RE.test(url)) {
    return T_IMGUR_VIDEO;
  }
  if (GFYCAT_RE.test(url)) {
    return T_GFYCAT;
  }
  if (GIPHY_RE.test(url)) {
    return T_GIPHY;
  }
  if (APARAT_RE.test(url)) {
    return T_APARAT;
  }
  return null;
}

function getVideoId(url) {
  let m;
  if ((m = YOUTUBE_VIDEO_RE.exec(url))) {
    return m[1];
  }
  if ((m = VIMEO_VIDEO_RE.exec(url))) {
    return m[1];
  }
  if ((m = COUB_VIDEO_RE.exec(url))) {
    return m[1];
  }
  if ((m = IMGUR_VIDEO_RE.exec(url))) {
    return m[1];
  }
  if ((m = GFYCAT_RE.exec(url))) {
    return m[1];
  }
  if ((m = GIPHY_RE.exec(url))) {
    return m[1];
  }
  if ((m = APARAT_RE.exec(url))) {
    return m[1];
  }
  return null;
}

function getDefaultAspectRatio(url) {
  if (YOUTUBE_VIDEO_RE.test(url)) {
    return isYoutubeShort(url) ? 16 / 9 : 9 / 16;
  }
  if (VIMEO_VIDEO_RE.test(url)) {
    return 9 / 16;
  }
  if (COUB_VIDEO_RE.test(url)) {
    return 1;
  }
  if (IMGUR_VIDEO_RE.test(url)) {
    return 9 / 16;
  }
  if (GFYCAT_RE.test(url)) {
    return 9 / 16;
  }
  if (GIPHY_RE.test(url)) {
    return 9 / 16;
  }
  if (APARAT_RE.test(url)) {
    return 9 / 16;
  }
  return null;
}

function playerURLFromVimeo(url, withoutAutoplay) {
  const { hash } = new URL(url);

  const vars = VIMEO_VIDEO_RE.exec(url);
  const playerUrl = new URL(`https://player.vimeo.com/video/${vars[1]}`);
  playerUrl.hash = hash;

  if (vars.length > 2) {
    playerUrl.searchParams.append('h', vars[2]);
  }

  if (!withoutAutoplay) {
    playerUrl.searchParams.append('autoplay', '1');
  }

  return playerUrl.toString();
}

async function getYoutubeVideoInfo(url, withoutAutoplay) {
  const data = await cachedFetch(
    `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`,
  );

  // Youtube returns 401 for non-embeddable videos
  if (data.httpStatus === 401) {
    const id = getVideoId(url);
    // Fill data object with some default values
    delete data.error;
    data.html = `src="https://www.youtube.com/embed/${encodeURIComponent(id)}"`;
    data.title = '[Inaccessible]';
    data.thumbnail_url = `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
    data.thumbnail_width = 480;
    data.thumbnail_height = 360;
  }

  if (data.error) {
    return { error: data.error };
  }

  // const videoID = getVideoId(url);
  const [, embedUrl] = data.html.match(/src="([^"]+)"/);

  const info = {
    byline: `${data.title} on YouTube`,
    aspectRatio: aspectRatio.set(url, isYoutubeShort(url) ? 16 / 9 : 9 / 16),
    previewURL: data.thumbnail_url,
  };

  if (data.html.match(/videoseries/)) {
    info.html = data.html
      .replace(/width="\d+"/, `width="${data.thumbnail_width}"`)
      .replace(/height="\d+"/, `height="${data.thumbnail_height}"`);
  } else {
    const u = new URL(embedUrl);
    u.searchParams.append('rel', '0');
    u.searchParams.append('fs', '1');
    if (!withoutAutoplay) {
      u.searchParams.append('autoplay', '1');
    }
    u.searchParams.append('enablejsapi', '1');
    u.searchParams.append('start', youtubeStartTime(url));

    info.playerURL = u.toString();
  }

  return info;
}

async function getVimeoVideoInfo(url, withoutAutoplay) {
  const data = await cachedFetch(
    `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
  );

  if (data.error) {
    return { error: data.error };
  }

  if (!('title' in data)) {
    return { error: data.error ? data.error : 'error loading data' };
  }

  const playerURL = playerURLFromVimeo(url, withoutAutoplay);

  return {
    byline: `${data.title} by ${data.author_name}`,
    aspectRatio: aspectRatio.set(url, data.height / data.width),
    previewURL: data.thumbnail_url.replace(/\d+x\d+/, '450'),
    playerURL,
  };
}

async function getCoubVideoInfo(url, withoutAutoplay) {
  const oembedUrl = `https://coub.com/api/oembed.json?url=${encodeURIComponent(url)}`;
  const data = await cachedFetch(`${apiPrefix}/cors-proxy?url=${encodeURIComponent(oembedUrl)}`);

  if (data.error) {
    return { error: data.error };
  }

  if (!('title' in data)) {
    return { error: data.error ? data.error : 'error loading data' };
  }

  return {
    byline: `${data.title} by ${data.author_name}`,
    aspectRatio: aspectRatio.set(url, data.height / data.width),
    previewURL: data.thumbnail_url,
    playerURL: `https://coub.com/embed/${getVideoId(url)}${
      withoutAutoplay ? '' : '?autostart=true'
    }`,
  };
}

async function getImgurVideoInfo(url) {
  const id = getVideoId(url);
  const previewURL = `https://i.imgur.com/${id}h.jpg`;

  try {
    const img = await loadImage(previewURL);

    return {
      byline: 'View at Imgur',
      previewURL,
      aspectRatio: aspectRatio.set(url, img.height / img.width),
      videoURL: `https://i.imgur.com/${id}.mp4`,
    };
  } catch (e) {
    return { error: e.message };
  }
}

async function getGfycatVideoInfo(url) {
  const id = getVideoId(url);
  const data = await cachedFetch(`https://api.gfycat.com/v1/gfycats/${encodeURIComponent(id)}`);

  if (!data.gfyItem) {
    return { error: data.message || data.errorMessage || 'invalid gfycat API response' };
  }

  return {
    byline: `${data.gfyItem.title} at Gfycat`,
    previewURL: data.gfyItem.mobilePosterUrl,
    aspectRatio: aspectRatio.set(url, data.gfyItem.height / data.gfyItem.width),
    videoURL: data.gfyItem.mobileUrl,
  };
}

async function getGiphyVideoInfo(url) {
  const oembedUrl = `https://giphy.com/services/oembed?url=${encodeURIComponent(url)}`;
  const data = await cachedFetch(`${apiPrefix}/cors-proxy?url=${encodeURIComponent(oembedUrl)}`);

  if (data.error) {
    return { error: data.error };
  }

  if (!('title' in data)) {
    return { error: data.error ? data.error : 'error loading data' };
  }

  const id = getVideoId(url);

  return {
    byline: `${data.title} by ${data.author_name}`,
    aspectRatio: aspectRatio.set(url, data.height / data.width),
    previewURL: `https://i.giphy.com/media/${id}/giphy_s.gif`,
    videoURL: `https://i.giphy.com/media/${id}/giphy.mp4`,
    width: data.width,
    height: data.height,
  };
}

async function getAparatVideoInfo(url) {
  const id = getVideoId(url);
  const apiUrl = `https://www.aparat.com/etc/api/video/videohash/${id}`;
  const data = await cachedFetch(`${apiPrefix}/cors-proxy?url=${encodeURIComponent(apiUrl)}`);

  if (data.error) {
    return { error: data.error };
  }

  if (!('video' in data)) {
    return { error: data.error ? data.error : 'error loading data' };
  }

  const { video } = data;

  let ratio = 9 / 16;
  try {
    const img = await loadImage(video.big_poster);
    ratio = img.height / img.width;
  } catch {
    // ignore
  }
  return {
    byline: `${video.title} by ${video.sender_name}`,
    aspectRatio: aspectRatio.set(url, ratio),
    previewURL: video.big_poster,
    playerURL: video.frame,
  };
}

const videoHandlers = {
  T_YOUTUBE_VIDEO: getYoutubeVideoInfo,
  T_VIMEO_VIDEO: getVimeoVideoInfo,
  T_COUB_VIDEO: getCoubVideoInfo,
  T_IMGUR_VIDEO: getImgurVideoInfo,
  T_GFYCAT: getGfycatVideoInfo,
  T_GIPHY: getGiphyVideoInfo,
  T_APARAT: getAparatVideoInfo,
};

export async function getVideoInfo(url, withoutAutoplay) {
  const videoType = getVideoType(url);

  if (videoType in videoHandlers) {
    return videoHandlers[videoType](url, withoutAutoplay);
  }

  return { error: 'unknown video type' };
}

/**
 * Extract video start time from YouTube url
 * @param {String} url
 * @return {Number}
 */
function youtubeStartTime(url) {
  const {
    hash,
    query: { t },
  } = urlParse(url, true);
  if (t) {
    return ytSeconds(t);
  }
  if (hash && /t=/.test(hash)) {
    const { t } = queryParse(hash.slice(1));
    if (t) {
      return ytSeconds(t);
    }
  }
  return 0;
}

/**
 * @param {String} x time as number of seconds or in youtube format: #h#m#s
 * @return {Number}
 */
function ytSeconds(x) {
  if (/^\d+$/.test(x)) {
    return parseInt(x);
  }

  const m = /^(?:(?:(\d+)h)?(\d+)m)?(\d+)s$/.exec(x);
  if (m) {
    let t = parseInt(m[3]);
    if (m[2]) {
      t += 60 * parseInt(m[2]);
    }
    if (m[1]) {
      t += 3600 * parseInt(m[1]);
    }
    return t;
  }

  return 0;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Cannot load image'));
    img.src = url;
  });
}

function isYoutubeShort(url) {
  return url.includes('/shorts/');
}
