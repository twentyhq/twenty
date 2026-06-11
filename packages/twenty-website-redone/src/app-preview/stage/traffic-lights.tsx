'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type MessageDescriptor } from '@lingui/core';
import { type MouseEvent as ReactMouseEvent } from 'react';

import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';

import { FlyingTrafficLights } from './flying-traffic-lights';
import { TRAFFIC_LIGHT_DOT_DEFINITIONS } from './traffic-light-definitions';
import { useTrafficLightsEscape } from './use-traffic-lights-escape';

// The macOS window controls, ported as-is: every instance (app window AND
// terminal) is escape-capable — the prompt egg's window event sends all
// six dots flying. Zoom triple-click is the terminal's functional
// jump-to-end; close and minimize press but do nothing.
const DOT_ARIA_LABELS: Record<string, MessageDescriptor> = {
  Close: msg`Close`,
  Minimize: msg`Minimize`,
  Zoom: msg`Zoom`,
};

const Container = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  padding: 0 6px;
`;

const Dot = styled.button<{ $background: string; $backgroundActive: string }>`
  align-items: center;
  background: ${({ $background }) => $background};
  border: none;
  border-radius: 999px;
  cursor: pointer;
  display: flex;
  flex: 0 0 auto;
  height: 12px;
  justify-content: center;
  padding: 0;
  position: relative;
  transition:
    background-color 0.12s ease,
    transform 0.12s ease;
  width: 12px;

  &::after {
    border-radius: 999px;
    box-shadow: inset 0 0 0 0.5px ${APP_PREVIEW_STAGE.trafficLight.ring};
    content: '';
    inset: 0;
    pointer-events: none;
    position: absolute;
  }

  svg {
    opacity: 0;
    transition: opacity 0.12s ease;
  }

  &:hover {
    background: ${({ $backgroundActive }) => $backgroundActive};

    svg {
      opacity: 1;
    }
  }

  &:active {
    transform: scale(0.92);
  }

  &[data-escaping='true'] {
    pointer-events: none;
    visibility: hidden;
  }
`;

export function TrafficLights({
  onZoomTripleClick,
}: {
  onZoomTripleClick?: () => void;
} = {}) {
  const { i18n } = useLingui();
  const {
    handleCatchDot,
    handlePopAnimationEnd,
    isEscaping,
    portalReady,
    returnedDots,
    returningDots,
    setFlyingRef,
    setOriginalRef,
  } = useTrafficLightsEscape();

  const handleZoomClick = (event: ReactMouseEvent<HTMLElement>) => {
    if (event.detail === 3) {
      onZoomTripleClick?.();
    }
  };

  return (
    <Container aria-label={i18n._(msg`Window controls`)}>
      {TRAFFIC_LIGHT_DOT_DEFINITIONS.map(
        ({ background, backgroundActive, Glyph, label }, index) => (
          <Dot
            $background={background}
            $backgroundActive={backgroundActive}
            aria-label={i18n._(DOT_ARIA_LABELS[label])}
            data-escaping={
              isEscaping && !returnedDots[index] ? 'true' : 'false'
            }
            key={label}
            onClick={label === 'Zoom' ? handleZoomClick : undefined}
            ref={setOriginalRef(index)}
            type="button"
          >
            <Glyph />
          </Dot>
        ),
      )}
      <FlyingTrafficLights
        onCatchDot={handleCatchDot}
        onPopAnimationEnd={handlePopAnimationEnd}
        portalReady={portalReady}
        returningDots={returningDots}
        returnedDots={returnedDots}
        setFlyingRef={setFlyingRef}
        visible={isEscaping}
      />
    </Container>
  );
}
