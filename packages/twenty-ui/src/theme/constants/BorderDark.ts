import { css } from '@linaria/core';
import { BORDER_COMMON, BORDER_COMMON_CSS } from './BorderCommon';
import { COLOR } from './Colors';
import { GRAY_SCALE } from './GrayScale';

export const BORDER_DARK = {
  color: {
    strong: GRAY_SCALE.gray55,
    medium: GRAY_SCALE.gray65,
    light: GRAY_SCALE.gray70,
    secondaryInverted: GRAY_SCALE.gray35,
    inverted: GRAY_SCALE.gray20,
    danger: COLOR.red70,
    blue: COLOR.blue30,
  },
  ...BORDER_COMMON,
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const BORDER_DARK_CSS = css`
  --border-color-blue: ${BORDER_DARK.color.blue};
  --border-color-danger: ${BORDER_DARK.color.danger};
  --border-color-inverted: ${BORDER_DARK.color.inverted};
  --border-color-light: ${BORDER_DARK.color.light};
  --border-color-medium: ${BORDER_DARK.color.medium};
  --border-color-secondaryInverted: ${BORDER_DARK.color.secondaryInverted};
  --border-color-strong: ${BORDER_DARK.color.strong};
  ${BORDER_COMMON_CSS}
`;
