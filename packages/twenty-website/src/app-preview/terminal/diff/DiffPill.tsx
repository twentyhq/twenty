'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

const terminal = APP_PREVIEW_TONES.terminal;

const PillButton = styled.button<{ $active?: boolean }>`
  align-items: center;
  background: ${({ $active }) =>
    $active ? terminal.toggle.activeSegmentBackground : 'transparent'};
  border: 1px solid
    ${({ $active }) =>
      $active ? terminal.toggle.activeSegmentBorder : 'transparent'};
  border-radius: 6px;
  box-shadow: ${({ $active }) =>
    $active ? terminal.toggle.activeSegmentShadow : 'none'};
  box-sizing: border-box;
  cursor: pointer;
  display: inline-flex;
  font-family: ${APP_PREVIEW_STAGE.terminalFont.mono};
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
        ? terminal.toggle.activeSegmentBackground
        : terminal.toggle.inactiveSegmentHoverBackground};
    border-color: ${({ $active }) =>
      $active ? terminal.toggle.activeSegmentBorder : 'transparent'};
  }
`;

const Added = styled.span`
  color: ${APP_PREVIEW_TONES.terminal.diff.added};
`;

const Removed = styled.span`
  color: ${APP_PREVIEW_TONES.terminal.diff.removed};
`;

export function DiffPill({
  added,
  removed,
  isActive,
  onClick,
}: {
  added: number;
  removed: number;
  isActive?: boolean;
  onClick?: () => void;
}) {
  const { i18n } = useLingui();

  return (
    <PillButton
      $active={isActive}
      aria-label={
        isActive ? i18n._(msg`Hide changes`) : i18n._(msg`Show changes`)
      }
      aria-pressed={isActive}
      onClick={onClick}
      type="button"
    >
      <Added>+{added}</Added>
      <Removed>-{removed}</Removed>
    </PillButton>
  );
}
