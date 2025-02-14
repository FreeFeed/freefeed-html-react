const readyFrames = new WeakSet();

export async function playVimeoVideo(iframe) {
  await waitForReady(iframe);
  sendCommand(iframe, 'play');
}

export function pauseVimeoVideo(iframe) {
  sendCommand(iframe, 'pause');
}

function waitForReady(iframe) {
  if (readyFrames.has(iframe)) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const abortController = new AbortController();
    window.addEventListener(
      'message',
      ({ source, data }) => {
        if (source === iframe.contentWindow) {
          data = JSON.parse(data);
          if (data?.event === 'ready') {
            if (iframe.isConnected) {
              readyFrames.add(iframe);
              resolve();
            } else {
              reject(new Error('Vimeo iframe disconnected'));
            }
            abortController.abort();
          }
        }
      },
      { signal: abortController.signal },
    );
  });
}

function sendCommand(iframe, command) {
  if (readyFrames.has(iframe)) {
    send(iframe, { method: command });
  }
}

function send(iframe, data) {
  iframe.contentWindow?.postMessage(JSON.stringify(data), 'https://player.vimeo.com');
}
