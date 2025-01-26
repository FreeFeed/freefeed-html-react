const thumbnailMaxWidth = 525;
const thumbnailMaxHeight = 175;

const videoMaxWidth = 500;
const videoMaxHeight = 400;

export function thumbnailSize(att) {
  return fitIntoBox(att, thumbnailMaxWidth, thumbnailMaxHeight);
}

export function videoSize(att) {
  return fitIntoBox(att, videoMaxWidth, videoMaxHeight);
}

function fitIntoBox(att, boxWidth, boxHeight) {
  const [width, height] = [att.previewWidth ?? att.width, att.previewHeight ?? att.height];
  boxWidth = Math.min(boxWidth, width);
  boxHeight = Math.min(boxHeight, height);
  const wRatio = width / boxWidth;
  const hRatio = height / boxHeight;

  if (wRatio > hRatio) {
    return { width: boxWidth, height: Math.round(height / wRatio) };
  }

  return { width: Math.round(width / hRatio), height: boxHeight };
}
