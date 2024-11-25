/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { ANIMATION } from './Animation';
import { COLOR } from './Colors';
import { GRAY_SCALE } from './GrayScale';
import { ICON } from './Icon';
import { MODAL } from './Modal';
import { TEXT } from './Text';

export const THEME_COMMON = {
  color: COLOR,
  grayScale: GRAY_SCALE,
  icon: ICON,
  modal: MODAL,
  text: TEXT,
  animation: ANIMATION,
  spacingMultiplicator: 4,
  spacing: (...args: number[]) =>
    args.map((multiplicator) => `${multiplicator * 4}px`).join(' '),
  betweenSiblingsGap: `2px`,
  table: {
    horizontalCellMargin: '8px',
    checkboxColumnWidth: '32px',
    horizontalCellPadding: '8px',
  },
  rightDrawerWidth: '500px',
  clickableElementBackgroundTransition: 'background 0.1s ease',
  lastLayerZIndex: 2147483647,
};
