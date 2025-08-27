import { css } from '@linaria/core';

export const ANIMATION = {
  duration: {
    instant: 0.075,
    fast: 0.15,
    normal: 0.3,
    slow: 1.5,
  },
};

export type AnimationDuration = 'instant' | 'fast' | 'normal';

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const ANIMATION_CSS = css`
  --animation-duration-instant: ${ANIMATION.duration.instant};
  --animation-duration-fast: ${ANIMATION.duration.fast};
  --animation-duration-normal: ${ANIMATION.duration.normal};
  --animation-duration-slow: ${ANIMATION.duration.slow};
`;
