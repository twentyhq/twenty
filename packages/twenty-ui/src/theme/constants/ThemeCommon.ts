/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { ANIMATION } from './Animation';
import { COLOR } from './Colors';
import { GRAY_SCALE } from './GrayScale';
import { ICON } from './Icon';
import { MODAL } from './Modal';
import { TEXT } from './Text';
import { Spacing } from '@ui/theme';

export const THEME_COMMON = {
  color: COLOR,
  grayScale: GRAY_SCALE,
  icon: ICON,
  modal: MODAL,
  text: TEXT,
  animation: ANIMATION,
  spacingMultiplicator: 4,
  spacing: (...args: number[]) =>
    args.map((multiplicator) => `${multiplicator * 4}px`).join(' ') as Spacing,
  betweenSiblingsGap: `2px` as Spacing,
  table: {
    horizontalCellMargin: '8px' as Spacing,
    checkboxColumnWidth: '32px' as Spacing,
    horizontalCellPadding: '8px' as Spacing,
  },
  rightDrawerWidth: '500px' as Spacing,
  clickableElementBackgroundTransition: 'background 0.1s ease',
  lastLayerZIndex: 2147483647,
};
