import { css } from '@emotion/react';

export const BLUR_DARK = {
  light: 'blur(6px) saturate(200%) contrast(100%) brightness(130%)',
  medium: 'blur(12px) saturate(200%) contrast(100%) brightness(130%)',
  strong: 'blur(20px) saturate(200%) contrast(100%) brightness(130%)',
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const BLUR_DARK_CSS = css`
  --blur-light: ${BLUR_DARK.light};
  --blur-medium: ${BLUR_DARK.medium};
  --blur-strong: ${BLUR_DARK.strong};
`;
