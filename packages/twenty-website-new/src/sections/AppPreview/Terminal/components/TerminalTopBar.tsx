'use client';

import { styled } from '@linaria/react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { DiffPill } from '../TerminalDiff/DiffPill';
import { DIFF_TOTALS } from '../TerminalDiff/diff-data';
import { EDITOR_TOKENS } from '../TerminalEditor/utils/editor-tokens';
import type { TerminalToggleValue } from '../types/terminal-toggle-types';
import { TerminalTrafficLights } from '../TerminalTrafficLights/TerminalTrafficLights';
import { TERMINAL_TOKENS } from '../utils/terminal-tokens';
import { TerminalToggle } from './TerminalToggle';

type TerminalTopBarProps = {
  onDragStart: (event: ReactPointerEvent<HTMLDivElement>) => void;
  isDragging: boolean;
  onZoomTripleClick?: () => void;
  view?: TerminalToggleValue;
  onViewChange?: (value: TerminalToggleValue) => void;
  diffVisible?: boolean;
  diffOpen?: boolean;
  onToggleDiff?: () => void;
};

const TopBarRoot = styled.div<{ $isDragging: boolean; $dark?: boolean }>`
  align-items: center;
  background: ${({ $dark }) =>
    $dark ? EDITOR_TOKENS.surface.topBar : 'transparent'};
  border-bottom: 1px solid
    ${({ $dark }) =>
      $dark
        ? EDITOR_TOKENS.surface.topBarBorder
        : TERMINAL_TOKENS.surface.topBarBorder};
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

export const TerminalTopBar = ({
  onDragStart,
  isDragging,
  onZoomTripleClick,
  view,
  onViewChange,
  diffVisible = false,
  diffOpen = false,
  onToggleDiff,
}: TerminalTopBarProps) => {
  const isDark = view === 'editor';
  return (
    <TopBarRoot
      $dark={isDark}
      $isDragging={isDragging}
      onPointerDown={onDragStart}
    >
      <TerminalTrafficLights onZoomTripleClick={onZoomTripleClick} />
      <TerminalToggle
        onChange={onViewChange}
        theme={isDark ? 'dark' : 'light'}
        value={view}
      />
      <TopRight $visible={diffVisible && !isDark}>
        <DiffPill
          added={DIFF_TOTALS.added}
          isActive={diffOpen}
          onClick={onToggleDiff}
          removed={DIFF_TOTALS.removed}
        />
      </TopRight>
    </TopBarRoot>
  );
};
