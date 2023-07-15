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

/**
 * LiberaPay (https://liberapay.com/) logo
 */
export const faLiberaPay = {
  iconName: 'comment-plus',
  prefix: 'fas',
  icon: [
    80,
    80,
    [],
    '',
    `M26 63c-3.7 0-6.5-.4-8.5-1.4a9 9 0 01-4.4-3.8 11 11 0 01-1.3-5.5c0-2 ` +
      `.4-4.3 1-6.7l9.5-40L34 3.8 23.5 47.2l-.3 2.5c0 .7 0 1.4.4 2 .3.6.8 1 ` +
      `1.5 1.4.7.3 1.8.6 3 .7L26 63M68.2 38c0 3.8-.7 7.1-1.9 10.1a22.4 22.4 0 ` +
      `01-12.7 13 25.4 25.4 0 01-14.9 1.5l-3.4 13.6H24.2l12.5-52.1A66 66 0 ` +
      `0152 21.7c2.8 0 5.3.4 7.3 1.3a13.6 13.6 0 018 8.7c.5 2 .9 4.1.9 6.4M40.8 ` +
      `53.5c.8.2 1.9.3 3.1.3a11.8 11.8 0 009.5-4.1c1.1-1.3 2-2.9 ` +
      `2.7-4.7.6-1.9.9-3.9.9-6 0-2.2-.5-4-1.4-5.6-1-1.5-2.7-2.3-5-2.3-1.6 ` +
      `0-3.1.2-4.5.5l-5.3 22`,
  ],
};

/**
 * YooMoney (https://yoomoney.ru/) logo
 */
export const faYooMoney = {
  iconName: 'comment-plus',
  prefix: 'fas',
  icon: [
    169,
    120,
    [],
    '',
    `M108.99 0c-33.42 0-60 26.96-60 60 0 33.42 26.96 60 60 60s60-26.96 ` +
      `60-60-26.96-60-60-60zm0 82.4c-12.15 0-22.4-10.25-22.4-22.4 0-12.15 ` +
      `10.25-22.4 22.4-22.4 12.15 0 22.4 10.25 22.4 22.4-.37 12.15-10.25 ` +
      `22.4-22.4 22.4zM48.6 17.47v87.34H27.35L0 17.47h48.6z`,
  ],
};

/**
 * Boosty (https://boosty.to/) logo
 */
export const faBoosty = {
  iconName: 'comment-plus',
  prefix: 'fas',
  icon: [
    32,
    40,
    [],
    '',
    `M1.04 23.9 7.82 0h10.4l-2.1 7.4a.74.74 0 0 0-.06.14L10.54 27.1h5.15A8849.7 ` +
      `8849.7 0 0 0 10.64 40C1.13 39.9-1.54 32.95.8 24.73l.24-.84ZM10.67 ` +
      `40l12.54-18.4h-5.32l4.63-11.79c7.94.85 11.66 7.22 9.47 14.92C29.64 33.02 ` +
      `20.13 40 10.87 40h-.2Z`,
  ],
};

/**
 * "Translate" icon from Material Symbols
 * https://developers.google.com/fonts/docs/material_symbols#getting_material_symbols
 */
export const faTranslate = {
  iconName: 'translate',
  prefix: 'fas',
  icon: [
    960,
    960,
    [],
    '',
    `M475 880l181-480h82l186 480h-87l-41-126h-192l-47 126h-82zm151-196h142l-70-194h-2l-70 ` +
      `194zm-466 76-55-55 204-204q-38-44-67.5-88.5t-51.5-92.5h87q17 33 37.5 62.5t46.5 60.5q45-47 ` +
      `75-97.5t51-105.5h-447v-80h280v-80h80v80h280v80h-113q-22 69-58.5 135.5t-89.5 126.5l98 ` +
      `99-30 81-127-122-200 200z`,
  ],
};
