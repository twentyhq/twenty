import { css } from '@linaria/core';

import { color, EASING, REDUCED_MOTION, spacing } from '@/tokens';

// A partner's place: blue, edged in white. Featured, it grows a quarter and a
// blue ring pulses out of it. The globe's points and the directory cards'
// cover point share it, so a place looks the same everywhere.
export const PLACE_POINT_FEATURED_SCALE = 1.25;

export const placePointClassName = css`
  background-color: ${color('blue')};
  border: 2px solid ${color('white')};
  border-radius: 50%;
  height: ${spacing(3)};
  width: ${spacing(3)};

  &[data-featured]::after {
    animation: placePointRing 1.8s ${EASING.standard} infinite;
    border: 1px solid ${color('blue')};
    border-radius: 50%;
    content: '';
    inset: -2px;
    position: absolute;
  }

  @keyframes placePointRing {
    from {
      opacity: 0.8;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(3);
    }
  }

  ${REDUCED_MOTION} {
    &[data-featured]::after {
      animation: none;
      opacity: 0;
    }
  }
`;
