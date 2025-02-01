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

export function fitIntoBox(att, boxWidth, boxHeight) {
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

/**
 * @param {number[]} ratios
 * @param {number} containerWidth
 * @param {number} thumbArea
 * @param {number} gap
 * @returns {{width: number, height: number}[][]}
 */
export function getGallerySizes(ratios, containerWidth, thumbArea, gap) {
  let start = 0;
  const lines = [];
  while (start < ratios.length) {
    const line = getGalleryLine(ratios.slice(start), containerWidth, thumbArea, gap);
    lines.push(line);
    start += line.length;
  }
  return lines;
}

/**
 * @param {number[]} ratios
 * @param {number} containerWidth
 * @param {number} thumbArea
 * @param {number} gap
 * @returns {{width: number, height: number}[]}
 */
function getGalleryLine(ratios, containerWidth, thumbArea, gap) {
  let avgRatio = 0;
  let prevHeight = 0;
  let prevDiff = Infinity;
  let n = 0;
  for (const ratio of ratios) {
    n++;
    avgRatio = (avgRatio * (n - 1) + ratio) / n; // Average ratio of one item
    const avgWidth = (containerWidth - gap * (n - 1)) / n; // Average width of one item
    const height = avgWidth / avgRatio;
    const avgArea = height * avgWidth; // Average area of one item
    const diff = Math.abs(thumbArea - avgArea);
    if (diff >= prevDiff) {
      return ratios
        .slice(0, n - 1)
        .map((r) => ({ width: Math.floor(r * prevHeight), height: prevHeight }));
      // return { count: n - 1, height: prevHeight };
    }
    prevDiff = diff;
    prevHeight = Math.round(height);
  }

  // Last line
  if (prevDiff > 0.1 * thumbArea) {
    const height = Math.round(Math.sqrt(thumbArea / avgRatio));
    return ratios.map((r) => ({ width: Math.floor(r * height), height }));
    //return {
    //      count: n,
    //      height: Math.round(Math.sqrt(thumbArea / avgRatio)),
    //    };
  }
  return ratios.map((r) => ({ width: Math.floor(r * prevHeight), height: prevHeight }));

  //  return { length: n, height: prevHeight };
}
