'use client';

import { styled } from '@linaria/react';
import { type PointerEvent as ReactPointerEvent } from 'react';

import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { TrafficLights } from '../stage/traffic-lights';

// The center toggle (chat/editor) and the right-side diff pill land with
// the editor commit; the grid already reserves their columns.
const TopBarRoot = styled.div<{ $isDragging: boolean }>`
  align-items: center;
  background: transparent;
  border-bottom: 1px solid ${APP_PREVIEW_TONES.terminal.surface.topBarBorder};
  box-sizing: border-box;
  cursor: ${({ $isDragging }) => ($isDragging ? 'grabbing' : 'grab')};
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  height: 48px;
  padding: 0 12px;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
  user-select: none;
  width: 100%;
`;

export function TerminalTopBar({
  onDragStart,
  isDragging,
  onZoomTripleClick,
}: {
  onDragStart: (event: ReactPointerEvent<HTMLDivElement>) => void;
  isDragging: boolean;
  onZoomTripleClick?: () => void;
}) {
  return (
    <TopBarRoot $isDragging={isDragging} onPointerDown={onDragStart}>
      <TrafficLights onZoomTripleClick={onZoomTripleClick} />
    </TopBarRoot>
  );
}
