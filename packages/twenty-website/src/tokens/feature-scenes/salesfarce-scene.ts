const NAVY = '#000080';
const GREEN = '#008000';

const BEVEL_DARK = '#0a0a0a';
const BEVEL_LIGHT = '#ffffff';
const BEVEL_SHADOW = '#808080';
const BEVEL_HIGHLIGHT = '#dfdfdf';

const bevelRaised = `inset -1px -1px 0 0 ${BEVEL_DARK}, inset 1px 1px 0 0 ${BEVEL_LIGHT}, inset -2px -2px 0 0 ${BEVEL_SHADOW}, inset 2px 2px 0 0 ${BEVEL_HIGHLIGHT}`;
const bevelWindow = `inset -1px -1px 0 0 ${BEVEL_DARK}, inset 1px 1px 0 0 ${BEVEL_HIGHLIGHT}, inset -2px -2px 0 0 ${BEVEL_SHADOW}, inset 2px 2px 0 0 ${BEVEL_LIGHT}`;
const bevelPressed = `inset 1px 1px 0 0 ${BEVEL_DARK}, inset -1px -1px 0 0 ${BEVEL_LIGHT}`;
const bevelSunken = `inset -1.5px -1.5px 0 0 ${BEVEL_LIGHT}, inset 1.5px 1.5px 0 0 ${BEVEL_SHADOW}, inset -3px -3px 0 0 ${BEVEL_HIGHLIGHT}, inset 3px 3px 0 0 ${BEVEL_DARK}`;

export const SALESFARCE_SCENE = {
  panelBackground: '#c9c9c9',
  popupBackground: '#c0c0c0',
  hover: NAVY,
  titleBarGradient: `linear-gradient(90deg, ${NAVY} 0%, #1084d0 100%)`,
  popupTitleBarGradient: `linear-gradient(90deg, ${GREEN} 0%, #b5b5b5 100%)`,
  popupIcon: GREEN,
  starburstFill: '#009edb',
  starburstBorder: '#005fb2',
  starburstShadow: 'rgba(0, 40, 80, 0.45)',
  scanline: 'rgba(0, 0, 0, 0.03)',
  actionButtonBackground: 'rgba(255, 255, 255, 0.2)',
  selectAllBackground: 'rgba(28, 28, 28, 0.2)',
  checkboxUncheckedBackground: 'rgba(255, 255, 255, 0.05)',
  bevel: {
    raised: bevelRaised,
    window: bevelWindow,
    pressed: bevelPressed,
    sunken: bevelSunken,
  },
  tooltipShadow: `${bevelRaised}, 4px 4px 0 0 rgba(0, 0, 0, 0.15)`,
};
