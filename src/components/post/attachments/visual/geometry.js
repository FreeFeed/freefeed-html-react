export const maxPreviewAspectRatio = 2.5;

export const maxEditingPreviewWidth = 400;
export const maxEditingPreviewHeight = 175;
export const minEditingPreviewWidth = 60;
export const minEditingPreviewHeight = 60;

export const galleryGap = 8;

export const thumbArea = 210 ** 2; // px^2
export const singleImageThumbArea = 300 ** 2; // px^2
export const singleImageMaxHeight = 400;

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
 * @typedef {{items: {width: number, height: number}[], stretched: boolean}} GalleryRow
 */

/**
 * @param {number[]} ratios
 * @param {number} containerWidth
 * @param {number} thumbArea
 * @param {number} gap
 * @returns {GalleryRow[]}
 */
export function getGallerySizes(ratios, containerWidth, thumbArea, gap) {
  let start = 0;
  const lines = [];
  while (start < ratios.length) {
    const line = getGalleryLine(ratios.slice(start), containerWidth, thumbArea, gap);
    lines.push(line);
    if (line.items.length === 0) {
      // Prevent infinite loop
      throw new Error('Empty gallery line');
    }
    start += line.items.length;
  }
  return lines;
}

/**
 * @param {number[]} ratios
 * @param {number} containerWidth
 * @param {number} thumbArea
 * @param {number} gap
 * @returns {GalleryRow}
 */
function getGalleryLine(ratios, containerWidth, thumbArea, gap) {
  if (containerWidth < Math.sqrt(thumbArea)) {
    // A very narrow container (or just the first render), leave only the first item
    return {
      items: [{ width: containerWidth, height: Math.round(containerWidth / ratios[0]) }],
      stretched: true,
    };
  }

  // Maximum average upscale factor for the line
  const maxStretch = 0.4;

  let avgRatio = 0;
  let prevHeight = 0;
  let prevStretch = Infinity;
  let n = 0;
  for (const ratio of ratios) {
    n++;
    avgRatio = (avgRatio * (n - 1) + ratio) / n; // Average ratio of one item
    const avgWidth = (containerWidth - gap * (n - 1)) / n; // Average width of one item
    const height = avgWidth / avgRatio;
    const avgArea = height * avgWidth; // Average area of one item
    const stretch = Math.log(avgArea / thumbArea);
    if (Math.abs(stretch) >= Math.abs(prevStretch)) {
      if (prevStretch > maxStretch) {
        const height = Math.round(Math.sqrt(thumbArea / avgRatio));
        return { items: getItemsSizes(ratios.slice(0, n - 1), height), stretched: false };
      }
      return { items: getItemsSizes(ratios.slice(0, n - 1), prevHeight), stretched: true };
    }
    prevStretch = stretch;
    prevHeight = Math.round(height);
  }

  // Last line
  if (prevStretch > maxStretch) {
    const height = Math.round(Math.sqrt(thumbArea / avgRatio));
    return { items: getItemsSizes(ratios, height), stretched: false };
  }
  return { items: getItemsSizes(ratios, prevHeight), stretched: true };
}

function getItemsSizes(ratios, height) {
  return ratios.map((r) => ({ width: Math.floor(r * height), height }));
}
