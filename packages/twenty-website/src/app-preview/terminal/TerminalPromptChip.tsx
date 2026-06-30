import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

const terminal = APP_PREVIEW_TONES.terminal;

const ChipRoot = styled.button`
  align-items: center;
  background: ${terminal.surface.chipBackground};
  border: 1px solid ${terminal.surface.chipBorder};
  border-radius: 4px;
  color: ${terminal.text.chip};
  cursor: pointer;
  display: flex;
  flex-shrink: 1;
  font-family: ${APP_PREVIEW_STAGE.terminalFont.mono};
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
    background: ${terminal.surface.chipHoverBackground};
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

export function TerminalPromptChip({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <ChipRoot type="button">
      <ChipIcon aria-hidden>{icon}</ChipIcon>
      <ChipLabel>{label}</ChipLabel>
    </ChipRoot>
  );
}
