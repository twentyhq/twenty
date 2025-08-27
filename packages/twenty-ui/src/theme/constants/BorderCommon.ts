import { css } from '@emotion/react';

export const BORDER_COMMON = {
  radius: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    xl: '20px',
    xxl: '40px',
    pill: '999px',
    rounded: '100%',
  },
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const BORDER_COMMON_CSS = css`
  --border-radius-md: ${BORDER_COMMON.radius.md};
  --border-radius-pill: ${BORDER_COMMON.radius.pill};
  --border-radius-rounded: ${BORDER_COMMON.radius.rounded};
  --border-radius-sm: ${BORDER_COMMON.radius.sm};
  --border-radius-xl: ${BORDER_COMMON.radius.xl};
  --border-radius-xs: ${BORDER_COMMON.radius.xs};
  --border-radius-xxl: ${BORDER_COMMON.radius.xxl};
`;
