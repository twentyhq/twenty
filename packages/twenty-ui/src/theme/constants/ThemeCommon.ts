import { css } from '@linaria/core';
import { ANIMATION, ANIMATION_CSS } from './Animation';
import { COLOR, COLOR_CSS } from './Colors';
import { GRAY_SCALE, GRAY_SCALE_CSS } from './GrayScale';
import { ICON, ICON_CSS } from './Icon';
import { MODAL, MODAL_CSS } from './Modal';
import { TEXT, TEXT_CSS } from './Text';

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

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const THEME_COMMON_CSS = css`
  ${COLOR_CSS}
  ${GRAY_SCALE_CSS}
  ${ICON_CSS}
  ${MODAL_CSS}
  ${TEXT_CSS}
  ${ANIMATION_CSS}
  --between-siblings-gap: ${THEME_COMMON.betweenSiblingsGap};
  --spacing-multiplicator: ${THEME_COMMON.spacingMultiplicator};
  --table-horizontal-cell-margin: ${THEME_COMMON.table.horizontalCellMargin};
  --table-checkbox-column-width: ${THEME_COMMON.table.checkboxColumnWidth};
  --table-horizontal-cell-padding: ${THEME_COMMON.table.horizontalCellPadding};
  --right-drawer-width: ${THEME_COMMON.rightDrawerWidth};
  --clickable-element-background-transition: ${THEME_COMMON.clickableElementBackgroundTransition};
  --last-layer-z-index: ${THEME_COMMON.lastLayerZIndex};
  --spacing-1: ${THEME_COMMON.spacing(1)};
  --spacing-1-25: ${THEME_COMMON.spacing(1.25)};
  --spacing-1-5: ${THEME_COMMON.spacing(1.5)};
  --spacing-1-75: ${THEME_COMMON.spacing(1.75)};
  --spacing-2: ${THEME_COMMON.spacing(2)};
  --spacing-3: ${THEME_COMMON.spacing(3)};
  --spacing-4: ${THEME_COMMON.spacing(4)};
  --spacing-5: ${THEME_COMMON.spacing(5)};
  --spacing-6: ${THEME_COMMON.spacing(6)};
  --spacing-7: ${THEME_COMMON.spacing(7)};
  --spacing-8: ${THEME_COMMON.spacing(8)};
  --spacing-9: ${THEME_COMMON.spacing(9)};
  --spacing-10: ${THEME_COMMON.spacing(10)};
  --spacing-11: ${THEME_COMMON.spacing(11)};
  --spacing-12: ${THEME_COMMON.spacing(12)};
  --spacing-13: ${THEME_COMMON.spacing(13)};
  --spacing-14: ${THEME_COMMON.spacing(14)};
  --spacing-15: ${THEME_COMMON.spacing(15)};
  --spacing-16: ${THEME_COMMON.spacing(16)};
`;
