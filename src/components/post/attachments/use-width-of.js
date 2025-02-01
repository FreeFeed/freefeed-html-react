import { useEffect, useState } from 'react';

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
