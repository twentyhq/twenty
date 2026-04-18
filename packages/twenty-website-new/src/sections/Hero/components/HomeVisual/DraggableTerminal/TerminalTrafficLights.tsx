'use client';

import { styled } from '@linaria/react';
import { TERMINAL_TOKENS } from './terminalTokens';

const TRAFFIC_LIGHT_DOT_SIZE = 12;
const TRAFFIC_LIGHT_GAP = 8;
const DEFAULT_HORIZONTAL_INSET = 6;

const TrafficLightsContainer = styled.div<{ $horizontalInset: number }>`
  align-items: center;
  display: flex;
  gap: ${TRAFFIC_LIGHT_GAP}px;
  padding: 0 ${({ $horizontalInset }) => `${$horizontalInset}px`};
`;

const TrafficLightDot = styled.button<{
  $background: string;
  $backgroundActive: string;
}>`
  align-items: center;
  background: ${({ $background }) => $background};
  border: none;
  border-radius: 999px;
  cursor: pointer;
  display: flex;
  flex: 0 0 auto;
  height: ${TRAFFIC_LIGHT_DOT_SIZE}px;
  justify-content: center;
  padding: 0;
  position: relative;
  transition:
    background-color 0.12s ease,
    transform 0.12s ease;
  width: ${TRAFFIC_LIGHT_DOT_SIZE}px;

  &::after {
    border-radius: 999px;
    box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.12);
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
`;

const CloseGlyph = () => (
  <svg aria-hidden width="6" height="6" viewBox="0 0 6 6">
    <path
      d="M1 1 L5 5 M5 1 L1 5"
      stroke={TERMINAL_TOKENS.trafficLight.glyph}
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

const MinimizeGlyph = () => (
  <svg aria-hidden width="6" height="6" viewBox="0 0 6 6">
    <path
      d="M1 3 L5 3"
      stroke={TERMINAL_TOKENS.trafficLight.glyph}
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

const ZoomGlyph = () => (
  <svg aria-hidden width="6" height="6" viewBox="0 0 6 6">
    <path
      d="M1.5 1.5 L1.5 4.5 L4.5 4.5 Z M4.5 1.5 L1.5 4.5"
      fill={TERMINAL_TOKENS.trafficLight.glyph}
    />
  </svg>
);

type TerminalTrafficLightsProps = {
  horizontalInset?: number;
};

export const TerminalTrafficLights = ({
  horizontalInset = DEFAULT_HORIZONTAL_INSET,
}: TerminalTrafficLightsProps) => {
  return (
    <TrafficLightsContainer
      $horizontalInset={horizontalInset}
      aria-label="Window controls"
    >
      <TrafficLightDot
        aria-label="Close"
        $background={TERMINAL_TOKENS.trafficLight.close}
        $backgroundActive={TERMINAL_TOKENS.trafficLight.closeActive}
        type="button"
      >
        <CloseGlyph />
      </TrafficLightDot>
      <TrafficLightDot
        aria-label="Minimize"
        $background={TERMINAL_TOKENS.trafficLight.minimize}
        $backgroundActive={TERMINAL_TOKENS.trafficLight.minimizeActive}
        type="button"
      >
        <MinimizeGlyph />
      </TrafficLightDot>
      <TrafficLightDot
        aria-label="Zoom"
        $background={TERMINAL_TOKENS.trafficLight.zoom}
        $backgroundActive={TERMINAL_TOKENS.trafficLight.zoomActive}
        type="button"
      >
        <ZoomGlyph />
      </TrafficLightDot>
    </TrafficLightsContainer>
  );
};
