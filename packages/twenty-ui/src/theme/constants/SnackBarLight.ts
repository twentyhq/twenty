import { css } from '@linaria/core';
import { BACKGROUND_LIGHT } from '@ui/theme/constants/BackgroundLight';
import { FONT_LIGHT } from '@ui/theme/constants/FontLight';
import {
  SNACK_BAR_COMMON,
  SNACK_BAR_COMMON_CSS,
} from '@ui/theme/constants/SnackBarCommon';

export const SNACK_BAR_LIGHT = {
  ...SNACK_BAR_COMMON,
  default: {
    color: FONT_LIGHT.color.primary,
    backgroundColor: BACKGROUND_LIGHT.transparent.light,
  },
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const SNACK_BAR_LIGHT_CSS = css`
  --snack-bar-light-default-backgroundColor: ${SNACK_BAR_LIGHT.default
    .backgroundColor};
  --snack-bar-light-default-color: ${SNACK_BAR_LIGHT.default.color};
  ${SNACK_BAR_COMMON_CSS}
`;
