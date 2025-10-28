import { RGBA } from '@ui/theme/constants/Rgba';

/* eslint-disable @nx/workspace-no-hardcoded-colors */
export const BOX_SHADOW_DARK = {
  color: RGBA('#000000', 0.6),
  light: `0px 2px 4px 0px ${RGBA(
    '#000000',
    0.04,
  )}, 0px 0px 4px 0px ${RGBA('#000000', 0.08)}`,
  strong: `2px 4px 16px 0px ${RGBA(
    '#000000',
    0.16,
  )}, 0px 2px 4px 0px ${RGBA('#000000', 0.08)}`,
  underline: `0px 1px 0px 0px ${RGBA('#000000', 0.32)}`,
  superHeavy: `2px 4px 16px 0px ${RGBA(
    '#000000',
    0.12,
  )}, 0px 2px 4px 0px ${RGBA('#000000', 0.04)}`,
};
