import { css } from '@emotion/react';

export const TEXT = {
  lineHeight: {
    lg: 1.5,
    md: 1.1,
  },

  iconSizeMedium: 16,
  iconSizeSmall: 14,

  iconStrikeLight: 1.6,
  iconStrikeMedium: 2,
  iconStrikeBold: 2.5,
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const TEXT_CSS = css`
  --text-icon-size-medium: ${TEXT.iconSizeMedium};
  --text-icon-size-small: ${TEXT.iconSizeSmall};
  --text-icon-strike-bold: ${TEXT.iconStrikeBold};
  --text-icon-strike-light: ${TEXT.iconStrikeLight};
  --text-icon-strike-medium: ${TEXT.iconStrikeMedium};
  --text-line-height-lg: ${TEXT.lineHeight.lg};
  --text-line-height-md: ${TEXT.lineHeight.md};
`;
