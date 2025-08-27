import { css } from '@emotion/react';
import { BACKGROUND_DARK } from '@ui/theme/constants/BackgroundDark';
import { FONT_DARK } from '@ui/theme/constants/FontDark';
import {
  SNACK_BAR_COMMON,
  SNACK_BAR_COMMON_CSS,
} from '@ui/theme/constants/SnackBarCommon';

export const SNACK_BAR_DARK = {
  ...SNACK_BAR_COMMON,
  default: {
    color: FONT_DARK.color.primary,
    backgroundColor: BACKGROUND_DARK.transparent.light,
  },
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const SNACK_BAR_DARK_CSS = css`
  --snack-bar-dark-default-backgroundColor: ${SNACK_BAR_DARK.default
    .backgroundColor};
  --snack-bar-dark-default-color: ${SNACK_BAR_DARK.default.color};
  ${SNACK_BAR_COMMON_CSS}
`;
