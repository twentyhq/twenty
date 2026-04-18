'use client';

import { styled } from '@linaria/react';
import { TERMINAL_TOKENS } from '../terminalTokens';

type DiffPillProps = {
  added: number;
  removed: number;
  isActive?: boolean;
  onClick?: () => void;
};

// Single button styled like a segmented-control segment. Reads as plain
// monospace text by default; on hover (or when diff panel is open) it shows
// a subtle background so it feels like the TerminalToggle's active segment.
// Height (30px) matches the TerminalToggle outer shell so both controls
// align along the top bar baseline.
const PillButton = styled.button<{ $active?: boolean }>`
  align-items: center;
  background: ${({ $active }) =>
    $active ? TERMINAL_TOKENS.surface.activeSegmentBackground : 'transparent'};
  border: 1px solid
    ${({ $active }) =>
      $active ? TERMINAL_TOKENS.surface.activeSegmentBorder : 'transparent'};
  border-radius: 6px;
  box-shadow: ${({ $active }) =>
    $active ? TERMINAL_TOKENS.shadow.activeSegment : 'none'};
  box-sizing: border-box;
  cursor: pointer;
  display: inline-flex;
  font-family: ${TERMINAL_TOKENS.font.mono};
  font-size: 13px;
  font-weight: 500;
  gap: 4px;
  height: 30px;
  line-height: 1;
  padding: 0 8px;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${({ $active }) =>
      $active
        ? TERMINAL_TOKENS.surface.activeSegmentBackground
        : TERMINAL_TOKENS.surface.inactiveSegmentHoverBackground};
    border-color: ${({ $active }) =>
      $active ? TERMINAL_TOKENS.surface.activeSegmentBorder : 'transparent'};
  }
`;

const Added = styled.span`
  color: #377e5d;
`;

const Removed = styled.span`
  color: #a94a4f;
`;

export const DiffPill = ({
  added,
  removed,
  isActive,
  onClick,
}: DiffPillProps) => {
  return (
    <PillButton
      $active={isActive}
      aria-label={isActive ? 'Hide changes' : 'Show changes'}
      aria-pressed={isActive}
      onClick={onClick}
      type="button"
    >
      <Added>+{added}</Added>
      <Removed>-{removed}</Removed>
    </PillButton>
  );
};
