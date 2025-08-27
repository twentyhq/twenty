import { css } from '@emotion/react';
import { GRAY_SCALE } from '@ui/theme/constants/GrayScale';
import { COLOR } from './Colors';

export const ILLUSTRATION_ICON_DARK = {
  color: {
    blue: COLOR.blue50,
    gray: GRAY_SCALE.gray50,
  },
  fill: {
    blue: COLOR.blue70,
    gray: GRAY_SCALE.gray70,
  },
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const ILLUSTRATION_ICON_DARK_CSS = css`
  --illustration-icon-color-blue: ${ILLUSTRATION_ICON_DARK.color.blue};
  --illustration-icon-color-gray: ${ILLUSTRATION_ICON_DARK.color.gray};
  --illustration-icon-fill-blue: ${ILLUSTRATION_ICON_DARK.fill.blue};
  --illustration-icon-fill-gray: ${ILLUSTRATION_ICON_DARK.fill.gray};
`;
