export const maxPreviewAspectRatio = 2.5;

export const maxEditingPreviewWidth = 400;
export const maxEditingPreviewHeight = 175;
export const minEditingPreviewWidth = 60;
export const minEditingPreviewHeight = 60;

export function fitIntoBox(att, boxWidth, boxHeight, upscale = false) {
  const [width, height] = [att.previewWidth ?? att.width, att.previewHeight ?? att.height];
  if (!upscale) {
    boxWidth = Math.min(boxWidth, width);
    boxHeight = Math.min(boxHeight, height);
  }
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
    const diff = Math.log(avgArea / thumbArea);
    if (Math.abs(diff) >= Math.abs(prevDiff)) {
      return ratios
        .slice(0, n - 1)
        .map((r) => ({ width: Math.floor(r * prevHeight), height: prevHeight }));
    }
    prevDiff = diff;
    prevHeight = Math.round(height);
  }

  // Last line
  if (prevDiff > 0.1) {
    const height = Math.round(Math.sqrt(thumbArea / avgRatio));
    return ratios.map((r) => ({ width: Math.floor(r * height), height }));
  }
  return ratios.map((r) => ({ width: Math.floor(r * prevHeight), height: prevHeight }));
}
