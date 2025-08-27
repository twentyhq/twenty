import { css } from '@linaria/core';
import { MAIN_COLORS, MAIN_COLORS_CSS } from './MainColors';
import { SECONDARY_COLORS, SECONDARY_COLORS_CSS } from './SecondaryColors';

export const COLOR = {
  ...MAIN_COLORS,
  ...SECONDARY_COLORS,
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const COLOR_CSS = css`
  ${MAIN_COLORS_CSS}
  ${SECONDARY_COLORS_CSS}
`;
