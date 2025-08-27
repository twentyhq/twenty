import { css } from '@emotion/react';
import { COLOR } from './Colors';
import { FONT_COMMON, FONT_COMMON_CSS } from './FontCommon';
import { GRAY_SCALE } from './GrayScale';

export const FONT_LIGHT = {
  color: {
    primary: GRAY_SCALE.gray60,
    secondary: GRAY_SCALE.gray50,
    tertiary: GRAY_SCALE.gray40,
    light: GRAY_SCALE.gray35,
    extraLight: GRAY_SCALE.gray30,
    inverted: GRAY_SCALE.gray0,
    danger: COLOR.red,
  },
  ...FONT_COMMON,
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const FONT_LIGHT_CSS = css`
  --font-color-primary: ${FONT_LIGHT.color.primary};
  --font-color-secondary: ${FONT_LIGHT.color.secondary};
  --font-color-tertiary: ${FONT_LIGHT.color.tertiary};
  --font-color-light: ${FONT_LIGHT.color.light};
  --font-color-extraLight: ${FONT_LIGHT.color.extraLight};
  --font-color-inverted: ${FONT_LIGHT.color.inverted};
  --font-color-danger: ${FONT_LIGHT.color.danger};
  ${FONT_COMMON_CSS}
`;
