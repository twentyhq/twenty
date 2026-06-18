'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type ComponentType, type RefCallback } from 'react';
import { createPortal } from 'react-dom';

import { Z_INDEX } from '@/tokens';
import { APP_PREVIEW_MOTION } from '@/tokens/app-preview/app-preview-motion';
import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';

import { TRAFFIC_LIGHT_DOT_DEFINITIONS } from './TrafficLightDefinitions';

const DOT_SIZE = 12;

const FlyingDotContainer = styled.button`
  background: transparent;
  border: none;
  cursor: default;
  display: block;
  height: ${DOT_SIZE}px;
  left: 0;
  padding: 0;
  pointer-events: none;
  position: fixed;
  top: 0;
  width: ${DOT_SIZE}px;
  z-index: ${Z_INDEX.portal};

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
  box-shadow: inset 0 0 0 0.5px ${APP_PREVIEW_STAGE.trafficLight.ring};
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
    animation: dotPop 0.38s ${APP_PREVIEW_MOTION.revealPulseEase} forwards;
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

function FlyingDot({
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
}) {
  return (
    <FlyingDotBall
      $background={background}
      $backgroundActive={backgroundActive}
      data-returning={returning ? 'true' : 'false'}
      onAnimationEnd={onAnimationEnd}
    >
      <Glyph />
    </FlyingDotBall>
  );
}

export function FlyingTrafficLights({
  onCatchDot,
  onPopAnimationEnd,
  portalReady,
  returningDots,
  returnedDots,
  setFlyingRef,
  visible,
}: {
  onCatchDot: (index: number) => void;
  onPopAnimationEnd: (index: number) => void;
  portalReady: boolean;
  returningDots: boolean[];
  returnedDots: boolean[];
  setFlyingRef: (index: number) => RefCallback<HTMLButtonElement>;
  visible: boolean;
}) {
  const { i18n } = useLingui();

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
              aria-label={i18n._(msg`Return traffic light`)}
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
}
