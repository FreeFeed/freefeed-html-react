const readyFrames = new WeakSet();

export async function playYoutubeVideo(iframe) {
  await waitForReady(iframe);
  sendCommand(iframe, 'playVideo');
}

export function pauseYoutubeVideo(iframe) {
  sendCommand(iframe, 'pauseVideo');
}

function waitForReady(iframe) {
  if (readyFrames.has(iframe)) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => send(iframe, { event: 'listening' }), 250);

    const abortController = new AbortController();
    setTimeout(() => {
      // Force abort after 10 seconds
      abortController.abort();
      clearInterval(timer);
      reject(new Error('Timeout'));
    }, 10_000);
    window.addEventListener(
      'message',
      ({ source, data }) => {
        if (source === iframe.contentWindow) {
          data = JSON.parse(data);
          switch (data?.event) {
            case 'initialDelivery': {
              // The player has heard our messages
              clearInterval(timer);
              break;
            }
            case 'onReady': {
              // The player is ready to receive commands
              readyFrames.add(iframe);
              abortController.abort();
              resolve();
              break;
            }
          }
        }
      },
      { signal: abortController.signal },
    );
  });
}

function sendCommand(iframe, command) {
  if (readyFrames.has(iframe)) {
    send(iframe, { event: 'command', func: command });
  }
}

function send(iframe, data) {
  iframe.contentWindow?.postMessage(JSON.stringify(data), 'https://www.youtube.com');
}
