'use client';

import { styled } from '@linaria/react';
import type { ComponentType, RefCallback } from 'react';
import { createPortal } from 'react-dom';
import { theme } from '@/theme';
import { TRAFFIC_LIGHT_DOT_SIZE } from '../utils/terminal-traffic-light-constants';
import { TRAFFIC_LIGHT_DOT_DEFINITIONS } from './TerminalTrafficLightDefinitions';

const FlyingDotContainer = styled.button`
  background: transparent;
  border: none;
  cursor: default;
  display: block;
  height: ${TRAFFIC_LIGHT_DOT_SIZE}px;
  left: 0;
  padding: 0;
  pointer-events: none;
  position: fixed;
  top: 0;
  width: ${TRAFFIC_LIGHT_DOT_SIZE}px;
  z-index: ${theme.zIndex.portalTop};

  &[data-resting='true'] {
    cursor: pointer;
    pointer-events: auto;
  }
`;

const FlyingDotBall = styled.span<{
  $background: string;
  $backgroundActive: string;
}>`
  align-items: center;
  background: ${({ $background }) => $background};
  border-radius: 999px;
  box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.12);
  display: flex;
  height: 100%;
  justify-content: center;
  transform-origin: center;
  transition: background-color 0.12s ease;
  width: 100%;

  svg {
    opacity: 0;
    transition: opacity 0.12s ease;
  }

  [data-resting='true']:hover > & {
    background: ${({ $backgroundActive }) => $backgroundActive};
  }

  [data-resting='true']:hover > & svg {
    opacity: 1;
  }

  &[data-returning='true'] {
    animation: dotPop 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes dotPop {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    40% {
      opacity: 1;
      transform: scale(1.55);
    }
    100% {
      opacity: 0;
      transform: scale(0);
    }
  }
`;

type TerminalFlyingTrafficLightsProps = {
  onCatchDot: (index: number) => void;
  onPopAnimationEnd: (index: number) => void;
  portalReady: boolean;
  returningDots: boolean[];
  returnedDots: boolean[];
  setFlyingRef: (index: number) => RefCallback<HTMLButtonElement>;
  visible: boolean;
};

export const TerminalFlyingTrafficLights = ({
  onCatchDot,
  onPopAnimationEnd,
  portalReady,
  returningDots,
  returnedDots,
  setFlyingRef,
  visible,
}: TerminalFlyingTrafficLightsProps) => {
  if (!visible || !portalReady || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <>
      {TRAFFIC_LIGHT_DOT_DEFINITIONS.map(
        ({ background, backgroundActive, Glyph, label }, index) =>
          returnedDots[index] ? null : (
            <FlyingDotContainer
              key={label}
              aria-label="Return traffic light"
              onClick={() => onCatchDot(index)}
              ref={setFlyingRef(index)}
              type="button"
            >
              <FlyingDot
                background={background}
                backgroundActive={backgroundActive}
                Glyph={Glyph}
                returning={returningDots[index] === true}
                onAnimationEnd={() => onPopAnimationEnd(index)}
              />
            </FlyingDotContainer>
          ),
      )}
    </>,
    document.body,
  );
};

const FlyingDot = ({
  background,
  backgroundActive,
  Glyph,
  onAnimationEnd,
  returning,
}: {
  background: string;
  backgroundActive: string;
  Glyph: ComponentType;
  onAnimationEnd: () => void;
  returning: boolean;
}) => (
  <FlyingDotBall
    $background={background}
    $backgroundActive={backgroundActive}
    data-returning={returning ? 'true' : 'false'}
    onAnimationEnd={onAnimationEnd}
  >
    <Glyph />
  </FlyingDotBall>
);
