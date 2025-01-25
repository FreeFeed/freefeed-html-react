import { useCallback, useEffect, useRef, useState } from 'react';
import * as _ from 'lodash-es';

import * as aspectRatio from './helpers/size-cache';
import FoldableContent from './helpers/foldable-content';

const INSTAGRAM_RE = /^https?:\/\/(?:www\.)?instagram\.com\/(?:p|tv|reel)\/([\w-]+)/i;

export function canShowURL(url) {
  return INSTAGRAM_RE.test(url);
}

export default function InstagramPreview({ url }) {
  const [, id] = INSTAGRAM_RE.exec(url);

  const iframeRef = useRef(null);
  const [isPrivate, setIsPrivate] = useState(false);

  const onIFrameLoad = useCallback(() => {
    const t = setTimeout(() => {
      if (iframeRef.current && !iframeRef.current.dataset['loaded']) {
        setIsPrivate(true);
        aspectRatio.set(url, 0);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [url]);

  useEffect(() => {
    startEventListening();
    // set default frame height
    if (iframeRef.current) {
      const r = aspectRatio.get(url, 470 / 400);
      iframeRef.current.style.height = `${iframeRef.current.offsetWidth * r}px`;
    }
  }, [url]);

  if (isPrivate) {
    return null;
  }

  return (
    <FoldableContent>
      <div className="instagram-preview link-preview-content">
        <iframe
          ref={iframeRef}
          src={`https://www.instagram.com/p/${id}/embed/captioned/`}
          data-url={url}
          onLoad={onIFrameLoad}
          frameBorder="0"
          scrolling="no"
          className="instagram-iframe"
        />
      </div>
    </FoldableContent>
  );
}

const startEventListening = _.once(() => window.addEventListener('message', onMessage));

function onMessage(e) {
  if (e.origin !== 'https://www.instagram.com') {
    return;
  }

  let data = null;
  try {
    data = JSON.parse(e.data);
  } catch {
    return;
  }

  if (
    typeof data !== 'object' ||
    typeof data.type !== 'string' ||
    typeof data.details !== 'object'
  ) {
    return;
  }

  const frames = document.querySelectorAll('iframe.instagram-iframe');
  const frame = [...frames].find((fr) => fr.contentWindow === e.source);
  if (frame) {
    if (data.type === 'MEASURE') {
      frame.style.height = `${data.details.height}px`;
      aspectRatio.set(frame.dataset['url'], data.details.height / frame.offsetWidth);
    } else if (data.type === 'LOADING') {
      frame.dataset['loaded'] = '1';
    }
  }
}

export function getEmbedInfo(url) {
  const [, id] = INSTAGRAM_RE.exec(url);

  return {
    byline: '',
    previewURL: `https://instagram.com/p/${id}/media/`,
    playerURL: `https://www.instagram.com/p/${id}/embed/`,
    w: 540,
    h: 540,
    aspectRatio: 1.2,
  };
}
