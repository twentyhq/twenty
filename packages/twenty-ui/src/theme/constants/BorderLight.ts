import { css } from '@linaria/core';
import { BORDER_COMMON, BORDER_COMMON_CSS } from './BorderCommon';
import { COLOR } from './Colors';
import { GRAY_SCALE } from './GrayScale';

export const BORDER_LIGHT = {
  color: {
    strong: GRAY_SCALE.gray25,
    medium: GRAY_SCALE.gray20,
    light: GRAY_SCALE.gray15,
    secondaryInverted: GRAY_SCALE.gray50,
    inverted: GRAY_SCALE.gray60,
    danger: COLOR.red20,
    blue: COLOR.blue30,
  },
  ...BORDER_COMMON,
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const BORDER_LIGHT_CSS = css`
  --border-color-blue: ${BORDER_LIGHT.color.blue};
  --border-color-danger: ${BORDER_LIGHT.color.danger};
  --border-color-inverted: ${BORDER_LIGHT.color.inverted};
  --border-color-light: ${BORDER_LIGHT.color.light};
  --border-color-medium: ${BORDER_LIGHT.color.medium};
  --border-color-secondaryInverted: ${BORDER_LIGHT.color.secondaryInverted};
  --border-color-strong: ${BORDER_LIGHT.color.strong};
  ${BORDER_COMMON_CSS}
`;
