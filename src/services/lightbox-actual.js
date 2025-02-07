/* eslint-disable import/no-unresolved */
/* eslint-disable unicorn/prefer-query-selector */
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import PhotoSwipeVideoPlugin from 'photoswipe-video-plugin';
import Mousetrap from 'mousetrap';
import pswpModule from 'photoswipe';
import 'photoswipe/photoswipe.css';
import '../../styles/shared/lighbox.scss';
import { getFullscreenAPI } from '../utils/fullscreen';
import { pinnedElements, unscrollTo } from './unscroll';
import { handlePip } from './pip-video';

const prevHotKeys = ['a', 'ф', 'h', 'р', '4'];
const nextHotKeys = ['d', 'в', 'k', 'л', '6'];
const fullScreenHotKeys = ['f', 'а'];

export function openLightbox(index, dataSource) {
  initLightbox().loadAndOpen(index, dataSource);
}

const fsApi = getFullscreenAPI();

// @see https://github.com/dimsemenov/PhotoSwipe/issues/1759#issue-914638063
const fullscreenIconsHtml = `<svg aria-hidden="true" class="pswp__icn" viewBox="0 0 32 32" width="32" height="32">
<!-- duplicate the paths for adding strokes -->
<use class="pswp__icn-shadow" xlink:href="#pswp__icn-fullscreen-close"/>
<use class="pswp__icn-shadow" xlink:href="#pswp__icn-fullscreen-open"/>
<!-- toggle full-screen mode icon path (id="pswp__icn-fullscreen-open") -->
<path d="M8 8v6.047h2.834v-3.213h3.213V8h-3.213zm9.953 0v2.834h3.213v3.213H24V8h-2.834zM8 17.953V24h6.047v-2.834h-3.213v-3.213zm13.166 0v3.213h-3.213V24H24v-6.047z" id="pswp__icn-fullscreen-open"/>
<!-- exit full-screen mode icon path (id="pswp__icn-fullscreen-close") -->
<path d="M11.213 8v3.213H8v2.834h6.047V8zm6.74 0v6.047H24v-2.834h-3.213V8zM8 17.953v2.834h3.213V24h2.834v-6.047h-2.834zm9.953 0V24h2.834v-3.213H24v-2.834h-3.213z" id="pswp__icn-fullscreen-close"/>
</svg>`;

const downloadIconHtml = {
  isCustomSVG: true,
  inner:
    '<path d="M20.5 14.3 17.1 18V10h-2.2v7.9l-3.4-3.6L10 16l6 6.1 6-6.1ZM23 23H9v2h14Z" id="pswp__icn-download"/>',
  outlineID: 'pswp__icn-download',
};

function initLightbox() {
  const lightbox = new PhotoSwipeLightbox({
    clickToCloseNonZoomable: false,
    tapAction(_, event) {
      // Close lightbox on background tap
      if (event.target.classList.contains('pswp__item')) {
        this.close();
      } else {
        // Toggle controls (default behavior)
        this.element?.classList.toggle('pswp--ui-visible');
      }
    },
    secondaryZoomLevel: 1,
    maxZoomLevel: 2,
    pswpModule,
  });

  new PhotoSwipeVideoPlugin(lightbox, {});

  // Add fullscreen button
  lightbox.on('uiRegister', () => {
    if (!fsApi) {
      return;
    }
    lightbox.pswp.ui.registerElement({
      name: 'fs',
      ariaLabel: 'Full screen',
      order: 9,
      isButton: true,
      html: fullscreenIconsHtml,
      onClick: () => {
        if (fsApi.isFullscreen()) {
          fsApi.exit();
        } else {
          fsApi.request(lightbox.pswp.element);
        }
      },
    });

    lightbox.pswp.ui.registerElement({
      name: 'download-button',
      order: 10,
      isButton: true,
      tagName: 'a',
      html: downloadIconHtml,
      onInit: (el, pswp) => {
        el.setAttribute('download', ''); // Does not work for cross-origin links:(
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');

        pswp.on('change', () => {
          el.href = pswp.currSlide.data.originalSrc;
        });
      },
    });

    const h = () =>
      document.documentElement.classList.toggle('pswp__fullscreen-mode', !!fsApi.isFullscreen());

    document.addEventListener(fsApi.changeEvent, h);
    lightbox.on('destroy', () => document.removeEventListener(fsApi.changeEvent, h));
    lightbox.on('close', () => fsApi.isFullscreen() && fsApi.exit());
  });

  lightbox.on('bindEvents', () => {
    const h = (e) => {
      if (e.ctrlKey || e.metaKey) {
        return;
      }
      e.preventDefault();
      lightbox.pswp.close();
    };
    document.addEventListener('wheel', h, { passive: false });
    lightbox.on('destroy', () => document.removeEventListener('wheel', h, { passive: false }));
  });

  // Add filters for the correct open/close animation
  lightbox.addFilter('placeholderSrc', (placeholderSrc, content) => {
    const thumb = document.getElementById(content.data.pid);
    return thumb?.src ?? placeholderSrc;
  });
  lightbox.addFilter('thumbEl', (thumbnail, itemData) => {
    const thumb = document.getElementById(itemData.pid);
    // offsetParent is not null when the element is visible
    return thumb?.offsetParent ? thumb : thumbnail;
  });

  // Handle back button
  let closedByNavigation = false;
  const close = () => {
    lightbox.pswp.close();
    closedByNavigation = true;
  };
  lightbox.on('beforeOpen', () => {
    window.addEventListener('popstate', close);
    history.pushState(null, '');
  });
  lightbox.on('destroy', () => {
    window.removeEventListener('popstate', close);
    if (!closedByNavigation) {
      history.back();
    }
  });

  // Handle keyboard navigation
  lightbox.on('beforeOpen', () => {
    Mousetrap.bind(prevHotKeys, () => lightbox.pswp.prev());
    Mousetrap.bind(nextHotKeys, () => lightbox.pswp.next());
    Mousetrap.bind(fullScreenHotKeys, () => document.querySelector('.pswp__button--fs')?.click());
  });
  lightbox.on('destroy', () => {
    Mousetrap.unbind(prevHotKeys);
    Mousetrap.unbind(nextHotKeys);
    Mousetrap.unbind(fullScreenHotKeys);
  });

  // Fix dimensions for images without known width/height
  lightbox.on('contentLoadImage', ({ content }) => {
    const { data, index } = content;
    if (data.autoSize) {
      delete data.autoSize;
      whenImageAndPswpLoaded(data.src, lightbox, (image, pswp) => {
        data.width = image.width;
        data.height = image.height;
        pswp.refreshSlideContent(index);
      });
    }
  });

  // Mount/unmount HTML content. This content can contain interactive players,
  // so for reliable playback stopping we need to unmount it when the slide
  // deactivates.
  lightbox.on('contentActivate', ({ content }) => {
    const { data, element } = content;
    data.onActivate?.call(data, element);
  });
  lightbox.on('contentDeactivate', ({ content }) => {
    const { data, element } = content;
    data.onDeactivate?.call(data, element);
  });

  // Compensate unwanted scroll after closing lightbox, which happens in some
  // mobile browsers.
  let pinnedEls = [];
  lightbox.on('close', () => {
    pinnedElements.capture();
    pinnedEls = [...pinnedElements];
  });
  lightbox.on('destroy', () => {
    const h = () => unscrollTo(pinnedEls);
    window.addEventListener('scroll', h, { once: true });
    setTimeout(() => window.removeEventListener('scroll', h, { once: true }), 500);
  });

  // Show animated images as a looped video without controls
  lightbox.on('contentLoad', (e) => {
    const { data, element } = e.content;
    if (data.meta?.inProgress) {
      e.preventDefault();
      e.content.element = document.createElement('div');
      e.content.element.classList.add('pswp__processing-indicator');
      e.content.element.textContent = 'Processing media...';
      return;
    }
    if (data.type === 'video') {
      handlePip(element);
      if (data.meta.animatedImage || (data.meta.silent && data.duration <= 5)) {
        element.muted = true;
        element.loop = true;
        element.controls = false;
      } else if (data.meta.silent) {
        element.muted = true;
      }
    }
  });

  // Init
  lightbox.init();
  return lightbox;
}

function whenImageAndPswpLoaded(src, lightbox, action) {
  const image = new Image();
  image.src = src;
  whenImageLoaded(image, () => {
    if (lightbox.pswp) {
      action(image, lightbox.pswp);
    } else {
      lightbox.on('afterInit', () => action(image, lightbox.pswp));
    }
  });
}

/**
 * Image has not "metadataloaded" event, and the "load" event fires only when
 * the whole image is loaded. So, to obtain the image dimensions faster, we need
 * to periodically check if the image.width is defined (not zero). When it is,
 * we have the image dimensions, even if the whole image is not loaded yet.
 *
 * @param {Image} image
 * @param {Function} action
 */
function whenImageLoaded(image, action) {
  const interval = 100; // ms
  if (image.complete || image.width > 0) {
    action();
  } else {
    setTimeout(() => whenImageLoaded(image, action), interval);
  }
}
