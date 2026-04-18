'use client';

import { styled } from '@linaria/react';
import type { ReactNode } from 'react';
import { TERMINAL_TOKENS } from './terminalTokens';

type TerminalPromptChipProps = {
  icon: ReactNode;
  label: string;
};

// min-width: 0 lets the chip shrink below its intrinsic content width so the
// inner label can ellipsize rather than forcing the footer to wrap.
const ChipRoot = styled.button`
  align-items: center;
  background: ${TERMINAL_TOKENS.surface.chipBackground};
  border: 1px solid ${TERMINAL_TOKENS.surface.chipBorder};
  border-radius: 4px;
  color: ${TERMINAL_TOKENS.text.chip};
  cursor: pointer;
  display: flex;
  flex-shrink: 1;
  font-family: ${TERMINAL_TOKENS.font.mono};
  font-size: 13px;
  font-weight: 500;
  gap: 4px;
  height: 24px;
  line-height: 1;
  min-width: 0;
  padding: 4px 8px;
  transition:
    background-color 0.14s ease,
    border-color 0.14s ease;
  white-space: nowrap;

  &:hover {
    background: ${TERMINAL_TOKENS.surface.chipHoverBackground};
  }
`;

const ChipIcon = styled.span`
  align-items: center;
  color: currentColor;
  display: flex;
  flex: 0 0 auto;
  height: 13px;
  justify-content: center;
  width: 13px;
`;

const ChipLabel = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const TerminalPromptChip = ({
  icon,
  label,
}: TerminalPromptChipProps) => {
  return (
    <ChipRoot type="button">
      <ChipIcon aria-hidden>{icon}</ChipIcon>
      <ChipLabel>{label}</ChipLabel>
    </ChipRoot>
  );
};
