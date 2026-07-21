import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

import {
  color,
  EASING,
  radius,
  REDUCED_MOTION,
  semanticColor,
  SHADOW,
} from '@/tokens';

export type PartnerCardIndexStyle = CSSProperties & {
  '--partner-card-index': number;
};

// Shared marketplace card shell: staggered entrance, hover lift, reduced-motion
// opt-out. The animation-delay formula is the single source of truth for the
// match card and every partner card (MarketplaceGrid offsets partner cards by
// +1 so they trail the match card at index 0).
export const CardFrame = styled.article`
  @keyframes partnerCardEnter {
    from {
      opacity: 0;
      transform: translate3d(0, 18px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  animation: partnerCardEnter 700ms ${EASING.standard} both;
  animation-delay: calc(var(--partner-card-index) * 90ms + 180ms);
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  isolation: isolate;
  position: relative;
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;

  &:hover {
    border-color: ${semanticColor.lineStrong};
    box-shadow: ${SHADOW.card};
    transform: translateY(-2px);
  }

  ${REDUCED_MOTION} {
    animation: none;
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;
