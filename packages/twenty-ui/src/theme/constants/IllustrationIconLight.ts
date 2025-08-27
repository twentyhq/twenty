import { css } from '@emotion/react';
import { GRAY_SCALE } from '@ui/theme/constants/GrayScale';
import { COLOR } from './Colors';

export const ILLUSTRATION_ICON_LIGHT = {
  color: {
    blue: COLOR.blue40,
    gray: GRAY_SCALE.gray40,
  },
  fill: {
    blue: COLOR.blue20,
    gray: GRAY_SCALE.gray20,
  },
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const ILLUSTRATION_ICON_LIGHT_CSS = css`
  --illustration-icon-color-blue: ${ILLUSTRATION_ICON_LIGHT.color.blue};
  --illustration-icon-color-gray: ${ILLUSTRATION_ICON_LIGHT.color.gray};
  --illustration-icon-fill-blue: ${ILLUSTRATION_ICON_LIGHT.fill.blue};
  --illustration-icon-fill-gray: ${ILLUSTRATION_ICON_LIGHT.fill.gray};
`;
