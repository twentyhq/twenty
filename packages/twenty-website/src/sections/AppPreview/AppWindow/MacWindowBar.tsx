'use client';

import { styled } from '@linaria/react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { TerminalTrafficLights } from '../Terminal/TerminalTrafficLights/TerminalTrafficLights';

type MacWindowBarProps = {
  title?: string;
  onDragStart: (event: ReactPointerEvent<HTMLDivElement>) => void;
  isDragging: boolean;
};

const BAR_BACKGROUND = '#F7F7F7';
const BAR_BORDER = 'rgba(0, 0, 0, 0.05)';
const TITLE_COLOR = 'rgba(40, 36, 30, 0.62)';
const BAR_VERTICAL_PADDING = 8;
const BAR_HORIZONTAL_PADDING = 12;
const TRAFFIC_LIGHT_WIDTH = 52;

const BarRoot = styled.div<{ $isDragging: boolean }>`
  align-items: center;
  background: ${BAR_BACKGROUND};
  border-bottom: 1px solid ${BAR_BORDER};
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
  cursor: ${({ $isDragging }) => ($isDragging ? 'grabbing' : 'grab')};
  display: grid;
  flex-shrink: 0;
  grid-template-columns: auto 1fr auto;
  padding: ${BAR_VERTICAL_PADDING}px ${BAR_HORIZONTAL_PADDING}px;
  user-select: none;
  width: 100%;
`;

const Title = styled.span`
  color: ${TITLE_COLOR};
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  justify-self: center;
  letter-spacing: 0.1px;
  text-align: center;
`;

const RightSpacer = styled.div`
  // Mirrors the Mac bar controls width so the centered title does not drift.
  width: ${TRAFFIC_LIGHT_WIDTH}px;
`;

export const MacWindowBar = ({
  title = 'Twenty',
  onDragStart,
  isDragging,
}: MacWindowBarProps) => {
  return (
    <BarRoot $isDragging={isDragging} onPointerDown={onDragStart}>
      <TerminalTrafficLights horizontalInset={0} />
      <Title>{title}</Title>
      <RightSpacer aria-hidden />
    </BarRoot>
  );
};
