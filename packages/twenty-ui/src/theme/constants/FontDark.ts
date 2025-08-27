import { css } from '@emotion/react';
import { COLOR } from './Colors';
import { FONT_COMMON, FONT_COMMON_CSS } from './FontCommon';
import { GRAY_SCALE } from './GrayScale';

export const FONT_DARK = {
  color: {
    primary: GRAY_SCALE.gray20,
    secondary: GRAY_SCALE.gray35,
    tertiary: GRAY_SCALE.gray45,
    light: GRAY_SCALE.gray50,
    extraLight: GRAY_SCALE.gray55,
    inverted: GRAY_SCALE.gray100,
    danger: COLOR.red,
  },
  ...FONT_COMMON,
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const FONT_DARK_CSS = css`
  --font-color-primary: ${FONT_DARK.color.primary};
  --font-color-secondary: ${FONT_DARK.color.secondary};
  --font-color-tertiary: ${FONT_DARK.color.tertiary};
  --font-color-light: ${FONT_DARK.color.light};
  --font-color-extraLight: ${FONT_DARK.color.extraLight};
  --font-color-inverted: ${FONT_DARK.color.inverted};
  --font-color-danger: ${FONT_DARK.color.danger};
  ${FONT_COMMON_CSS}
`;
