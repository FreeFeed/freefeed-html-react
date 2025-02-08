import { useCallback, useRef } from 'react';
import { noop } from 'lodash-es';
import { openLightbox } from '../../services/lightbox';
import { mediaLinksContext as ctx, createErrorItem, createLightboxItem, stubItem } from './helpers';

export function MediaLinksProvider({ children }) {
  const lightboxItems = useRef([]);
  const registerLink = useCallback((url, mediaType) => {
    if (!mediaType) {
      return noop;
    }
    lightboxItems.current.push(stubItem);
    const index = lightboxItems.current.length - 1;
    createLightboxItem(url, mediaType)
      .then((item) => (lightboxItems.current[index] = item))
      .catch((err) => (lightboxItems.current[index] = createErrorItem(err)));
    return (e) => {
      e.preventDefault();
      openLightbox(index, lightboxItems.current);
    };
  }, []);

  return <ctx.Provider value={registerLink}>{children}</ctx.Provider>;
}
