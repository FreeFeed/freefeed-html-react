export function handlePip(videoEl) {
  videoEl.addEventListener('leavepictureinpicture', (e) => {
    if (e.target.isConnected || e.target.paused) {
      return;
    }
    // Prevent disconnected video from playing after leaving PIP
    e.target.pause();
  });
}
