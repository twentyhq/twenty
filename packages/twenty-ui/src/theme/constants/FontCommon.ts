import { css } from '@linaria/core';

export const FONT_COMMON = {
  size: {
    xxs: '0.625rem',
    xs: '0.85rem',
    sm: '0.92rem',
    md: '1rem',
    lg: '1.23rem',
    xl: '1.54rem',
    xxl: '1.85rem',
  },
  weight: {
    regular: 400,
    medium: 500,
    semiBold: 600,
  },
  family: 'Inter, sans-serif',
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const FONT_COMMON_CSS = css`
  --font-family: ${FONT_COMMON.family};
  --font-size-xxs: ${FONT_COMMON.size.xxs};
  --font-size-xs: ${FONT_COMMON.size.xs};
  --font-size-sm: ${FONT_COMMON.size.sm};
  --font-size-md: ${FONT_COMMON.size.md};
  --font-size-lg: ${FONT_COMMON.size.lg};
  --font-size-xl: ${FONT_COMMON.size.xl};
  --font-size-xxl: ${FONT_COMMON.size.xxl};
`;
