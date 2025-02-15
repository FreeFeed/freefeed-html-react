import { useRef } from 'react';

const smoothInterval = 2; // 2 seconds

export function useSpeed(bytes) {
  const state = useRef({
    lastBytes: null,
    lastTime: null,
    currentSpeed: 0,
  });

  const { lastBytes, lastTime, currentSpeed } = state.current;

  const time = Date.now() / 1000;
  state.current.lastTime = time;
  state.current.lastBytes = bytes;

  if (lastTime === null) {
    // First call
    return 0;
  }

  const elapsed = time - lastTime;
  const bytesDiff = bytes - lastBytes;
  const momentSpeed = bytesDiff / elapsed;

  const alpha = 1 - Math.exp(-elapsed / smoothInterval);
  const smoothedSpeed =
    currentSpeed > 0 ? momentSpeed * alpha + currentSpeed * (1 - alpha) : momentSpeed;

  state.current.currentSpeed = smoothedSpeed;

  return smoothedSpeed;
}
