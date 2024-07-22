import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useEvent } from 'react-use-event-hook';
import { useSelector } from 'react-redux';
import { ButtonLink } from './button-link';
import { Icon } from './fontawesome-icons';
import { postFoldedArea } from './expandable-constants';
import style from './expandable.module.scss';

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator?.userAgent ?? '');

export function Expandable({
  children,
  expanded: givenExpanded = false,
  tail = null,
  panelClass = null,
  // See presets in ./expandable-constants.js
  foldedArea = postFoldedArea,
}) {
  const uiScale = useSelector((state) => state.uiScale ?? 100) / 100;
  const scaledFoldedArea = foldedArea * uiScale * uiScale;
  // Don't fold content that is smaller than this
  const scaledMaxUnfoldedArea = scaledFoldedArea * 1.5;

  const content = useRef(null);
  // Null means content doesn't need to be expandable
  const [maxHeight, setMaxHeight] = useState(null);

  const [expandedByUser, setExpandedByUser] = useState(false);
  const expand = useEvent(() => setExpandedByUser(true));

  const expanded = expandedByUser || givenExpanded;
  const clipped = maxHeight !== null && !expanded;

  // Update the maxHeight when the content dimensions changes
  const update = useEvent(({ width, height }) => {
    if (width * height < scaledMaxUnfoldedArea) {
      setMaxHeight(null);
    } else {
      let targetHeight = scaledFoldedArea / width;
      targetHeight = align(content.current, targetHeight);
      if (isSafari) {
        // Safari has extremely large string heights, so we need to slightly
        // reduce the clipping.
        targetHeight -= 4;
      }
      setMaxHeight(`${targetHeight}px`);
    }
  });

  // We use the layout effect just once, to set the initial height without
  // flickering.
  useLayoutEffect(
    () => {
      if (!expanded) {
        update(content.current.getBoundingClientRect());
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Update the maxHeight when the content resizes
  useEffect(() => {
    if (!expanded) {
      return observeResizeOf(content.current, ({ contentRect }) => update(contentRect));
    }
  }, [expanded, update]);

  return (
    <>
      <div
        className={clipped && style.clippedContent}
        style={{ maxHeight: expanded ? null : maxHeight }}
      >
        <div ref={content}>{children}</div>
      </div>
      {clipped && (
        <div className={cn('expand-button', panelClass)}>
          <ButtonLink className={style.button} tag="i" onClick={expand} aria-hidden>
            <Icon icon={faChevronDown} className={style.icon} /> Read more
          </ButtonLink>{' '}
          {tail}
        </div>
      )}
    </>
  );
}

/**
 * Align the given offset to the bottom of the closest text string
 *
 * @param {Element} rootElement
 * @param {number} targetOffset
 * @returns {number}
 */
function align(rootElement, targetOffset) {
  const { top } = rootElement.getBoundingClientRect();

  // Iterate over all the text nodes
  const nodeIterator = document.createNodeIterator(rootElement, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let node;
  let prev = null;
  let current = null;
  mainLoop: while ((node = nodeIterator.nextNode())) {
    range.selectNode(node);
    // In every text node we check all the rects
    for (const { bottom } of range.getClientRects()) {
      prev = current;
      current = bottom - top;
      if (current >= targetOffset) {
        break mainLoop;
      }
    }
  }
  if (!prev || !current) {
    return targetOffset;
  }
  return Math.abs(current - targetOffset) < Math.abs(prev - targetOffset) ? current : prev;
}

let resizeObserver = null;
const resizeHandlers = new Map();

/**
 * Subscribe to resize of the given element
 *
 * @param {Element} element
 * @param {(entry: ResizeObserverEntry) => void} callback
 * @returns {() => void} unsubscribe function
 */
function observeResizeOf(element, callback) {
  if (!resizeObserver) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        resizeHandlers.get(entry.target)?.(entry);
      }
    });
  }

  resizeHandlers.set(element, callback);
  resizeObserver.observe(element);
  return () => {
    resizeObserver.unobserve(element);
    resizeHandlers.delete(element);
  };
}
