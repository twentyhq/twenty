import { css } from '@linaria/core';

export const ICON = {
  size: {
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
  },
  stroke: {
    sm: 1.6,
    md: 2,
    lg: 2.5,
  },
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const ICON_CSS = css`
  --icon-size-sm: ${ICON.size.sm};
  --icon-size-md: ${ICON.size.md};
  --icon-size-lg: ${ICON.size.lg};
  --icon-size-xl: ${ICON.size.xl};
`;
