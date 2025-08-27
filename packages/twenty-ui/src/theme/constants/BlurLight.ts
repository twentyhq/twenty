import { css } from '@linaria/core';

export const BLUR_LIGHT = {
  light: 'blur(6px) saturate(200%) contrast(50%) brightness(130%)',
  medium: 'blur(12px) saturate(200%) contrast(50%) brightness(130%)',
  strong: 'blur(20px) saturate(200%) contrast(50%) brightness(130%)',
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const BLUR_LIGHT_CSS = css`
  --blur-light: ${BLUR_LIGHT.light};
  --blur-medium: ${BLUR_LIGHT.medium};
  --blur-strong: ${BLUR_LIGHT.strong};
`;
