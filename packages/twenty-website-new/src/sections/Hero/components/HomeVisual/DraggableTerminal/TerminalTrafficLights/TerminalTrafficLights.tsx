'use client';

import { styled } from '@linaria/react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import {
  DEFAULT_TRAFFIC_LIGHT_HORIZONTAL_INSET,
  TRAFFIC_LIGHT_GAP,
} from './terminal-traffic-light-constants';
import { TRAFFIC_LIGHT_DOT_DEFINITIONS } from './terminal-traffic-light-definitions';
import { TerminalFlyingTrafficLights } from './TerminalFlyingTrafficLights';
import { TerminalTrafficLightDot } from './TerminalTrafficLightDot';
import { useTerminalTrafficLightsEscape } from './use-terminal-traffic-lights-escape';

const TrafficLightsContainer = styled.div<{ $horizontalInset: number }>`
  align-items: center;
  display: flex;
  gap: ${TRAFFIC_LIGHT_GAP}px;
  padding: 0 ${({ $horizontalInset }) => `${$horizontalInset}px`};
`;

type TerminalTrafficLightsProps = {
  horizontalInset?: number;
  onZoomTripleClick?: () => void;
};

export const TerminalTrafficLights = ({
  horizontalInset = DEFAULT_TRAFFIC_LIGHT_HORIZONTAL_INSET,
  onZoomTripleClick,
}: TerminalTrafficLightsProps) => {
  const {
    handleCatchDot,
    handlePopAnimationEnd,
    isEscaping,
    portalReady,
    returnedDots,
    returningDots,
    setFlyingRef,
    setOriginalRef,
  } = useTerminalTrafficLightsEscape();

  const handleZoomClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    if (event.detail === 3) {
      onZoomTripleClick?.();
    }
  };

  return (
    <TrafficLightsContainer
      $horizontalInset={horizontalInset}
      aria-label="Window controls"
    >
      {TRAFFIC_LIGHT_DOT_DEFINITIONS.map(
        ({ background, backgroundActive, Glyph, label }, index) => (
          <TerminalTrafficLightDot
            key={label}
            background={background}
            backgroundActive={backgroundActive}
            escaping={isEscaping && !returnedDots[index]}
            Glyph={Glyph}
            label={label}
            onClick={label === 'Zoom' ? handleZoomClick : undefined}
            refCallback={setOriginalRef(index)}
          />
        ),
      )}
      <TerminalFlyingTrafficLights
        onCatchDot={handleCatchDot}
        onPopAnimationEnd={handlePopAnimationEnd}
        portalReady={portalReady}
        returningDots={returningDots}
        returnedDots={returnedDots}
        setFlyingRef={setFlyingRef}
        visible={isEscaping}
      />
    </TrafficLightsContainer>
  );
};
