/**
 * Combination of Font Awesome 5.0 'comment' (regular) and 'plus' (solid) icons.
 * https://github.com/FortAwesome/Font-Awesome/blob/master/LICENSE.txt
 */
export const faCommentPlus = {
  iconName: 'comment-plus',
  prefix: 'fas',
  icon: [
    512,
    512,
    [],
    '',
    `M256 431.6a16 16 0 0 1-16.8 16 310.8 310.8 0 0 1-76.1-13.9A242.6 242.6 0
    0 1 24 480a24 24 0 0 1-17.5-40.5c.5-.4 31.5-33.8 46.4-73.2C19.9 331.2 0 
    287.6 0 240 0 125.1 114.6 32 256 32s256 93.1 256 208c0 15.2-2 30-5.8 44.4a16
    16 0 0 1-20 11l-15.3-4.5a16 16 0 0 1-11-19.4c2.7-10.2 4.1-20.7 4.1-31.5 
    0-88.2-93.3-160-208-160S48 151.8 48 240c0 42.2 21.7 74.1 39.8 93.4l20.6 
    21.8-10.6 28.1a250.8 250.8 0 0 1-19.9 40.2 215 215 0 0 0 57.5-29l19.5-13.8 
    22.7 7.2a259.8 259.8 0 0 0 63.2 11.7 16 16 0 0 1 15.2 15.9v16.1zM478.8 
    343.8h-72v-72a16 16 0 0 0-16-16.1h-16a16 16 0 0 0-16.1 16v72.1h-72.1a16 
    16 0 0 0-16 16v16a16 16 0 0 0 16 16h72V464a16 16 0 0 0 16.1 16h16a16 16 
    0 0 0 16-16v-72h72.1a16 16 0 0 0 16-16v-16a16 16 0 0 0-16-16.1z`,
  ],
};

/**
 * An ellipsis icon path (•••)
 *
 * @param {number} r dot radius in 'pixels' (icon width is 24 'pixels')
 */
const ellipsisPath = (r) => {
  const dist = 12 - r;
  return (
    `M 0 12 a ${r} ${r} 0 0 0 ${2 * r} 0 a ${r} ${r} 0 0 0 ${-2 * r} 0 ` +
    `m ${dist} 0 a ${r} ${r} 0 0 0 ${2 * r} 0 a ${r} ${r} 0 0 0 ${-2 * r} 0 ` +
    `m ${dist} 0 a ${r} ${r} 0 0 0 ${2 * r} 0 a ${r} ${r} 0 0 0 ${-2 * r} 0z`
  );
};

export const faEllipsis = {
  iconName: 'ellipsis',
  prefix: 'fas',
  icon: [24, 24, [], '', ellipsisPath(3)],
};
