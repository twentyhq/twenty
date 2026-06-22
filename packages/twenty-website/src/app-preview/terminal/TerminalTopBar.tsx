'use client';

import { styled } from '@linaria/react';
import { type PointerEvent as ReactPointerEvent } from 'react';

import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { TrafficLights } from '../stage/TrafficLights';
import { CHANGESET_TOTALS } from './changeset-totals';
import { type TerminalView } from './conversation-core';
import { DiffPill } from './diff/DiffPill';
import { TerminalToggle } from './TerminalToggle';

const TopBarRoot = styled.div<{ $isDragging: boolean; $dark?: boolean }>`
  align-items: center;
  background: ${({ $dark }) =>
    $dark ? APP_PREVIEW_TONES.editor.surface.topBar : 'transparent'};
  border-bottom: 1px solid
    ${({ $dark }) =>
      $dark
        ? APP_PREVIEW_TONES.editor.surface.topBarBorder
        : APP_PREVIEW_TONES.terminal.surface.topBarBorder};
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

const TopRight = styled.div<{ $visible: boolean }>`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  transition: opacity 0.22s ease;
`;

export function TerminalTopBar({
  onDragStart,
  isDragging,
  onZoomTripleClick,
  view,
  onViewChange,
  diffVisible = false,
  diffOpen = false,
  onToggleDiff,
}: {
  onDragStart: (event: ReactPointerEvent<HTMLDivElement>) => void;
  isDragging: boolean;
  onZoomTripleClick?: () => void;
  view: TerminalView;
  onViewChange?: (value: TerminalView) => void;
  diffVisible?: boolean;
  diffOpen?: boolean;
  onToggleDiff?: () => void;
}) {
  const isDark = view === 'editor';

  return (
    <TopBarRoot
      $dark={isDark}
      $isDragging={isDragging}
      onPointerDown={onDragStart}
    >
      <TrafficLights onZoomTripleClick={onZoomTripleClick} />
      <TerminalToggle
        onChange={onViewChange}
        theme={isDark ? 'dark' : 'light'}
        value={view}
      />
      <TopRight $visible={diffVisible && !isDark}>
        <DiffPill
          added={CHANGESET_TOTALS.added}
          isActive={diffOpen}
          onClick={onToggleDiff}
          removed={CHANGESET_TOTALS.removed}
        />
      </TopRight>
    </TopBarRoot>
  );
}
