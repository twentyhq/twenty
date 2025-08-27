import { css } from '@emotion/react';
import { MAIN_COLORS } from '@ui/theme/constants/MainColors';
import { RGBA } from '@ui/theme/constants/Rgba';

export const SNACK_BAR_COMMON = {
  success: {
    color: MAIN_COLORS.turquoise,
    backgroundColor: RGBA(MAIN_COLORS.turquoise, 0.04),
  },
  error: {
    color: MAIN_COLORS.red,
    backgroundColor: RGBA(MAIN_COLORS.red, 0.04),
  },
  warning: {
    color: MAIN_COLORS.orange,
    backgroundColor: RGBA(MAIN_COLORS.orange, 0.04),
  },
  info: {
    color: MAIN_COLORS.blue,
    backgroundColor: RGBA(MAIN_COLORS.blue, 0.04),
  },
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const SNACK_BAR_COMMON_CSS = css`
  --snack-bar-common-error-backgroundColor: ${SNACK_BAR_COMMON.error
    .backgroundColor};
  --snack-bar-common-error-color: ${SNACK_BAR_COMMON.error.color};
  --snack-bar-common-info-backgroundColor: ${SNACK_BAR_COMMON.info
    .backgroundColor};
  --snack-bar-common-info-color: ${SNACK_BAR_COMMON.info.color};
  --snack-bar-common-success-backgroundColor: ${SNACK_BAR_COMMON.success
    .backgroundColor};
  --snack-bar-common-success-color: ${SNACK_BAR_COMMON.success.color};
  --snack-bar-common-warning-backgroundColor: ${SNACK_BAR_COMMON.warning
    .backgroundColor};
  --snack-bar-common-warning-color: ${SNACK_BAR_COMMON.warning.color};
`;
