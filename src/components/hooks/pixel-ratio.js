import { useEffect, useState } from 'react';

export function usePixelRatio() {
  const [pixelRatio, setPixelRatio] = useState(window.devicePixelRatio || 1);

  useEffect(() => {
    if (!window.matchMedia) {
      return;
    }
    const abortController = new AbortController();
    matchMedia(`(resolution: ${pixelRatio}dppx)`).addEventListener(
      'change',
      () => setPixelRatio(window.devicePixelRatio),
      { once: true, signal: abortController.signal },
    );
    return () => abortController.abort();
  }, [pixelRatio]);
  return pixelRatio;
}
