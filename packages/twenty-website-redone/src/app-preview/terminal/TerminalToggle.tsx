'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { ClaudeMark } from '@/icons';
import { type TerminalView } from './conversation-core';
import { CursorLogo } from './CursorLogo';

const terminal = APP_PREVIEW_TONES.terminal;
const editor = APP_PREVIEW_TONES.editor;

const ToggleRoot = styled.div<{ $dark?: boolean }>`
  align-items: center;
  background: ${({ $dark }) =>
    $dark ? editor.surface.toggleBackground : terminal.toggle.background};
  border: 1px solid
    ${({ $dark }) =>
      $dark ? editor.surface.toggleBorder : terminal.toggle.border};
  border-radius: 9px;
  box-sizing: border-box;
  display: flex;
  gap: 2px;
  padding: 3px;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
`;

const SegmentButton = styled.button<{ $active?: boolean; $dark?: boolean }>`
  align-items: center;
  background: ${({ $active, $dark }) => {
    if (!$active) {
      return 'transparent';
    }
    return $dark
      ? editor.surface.activeSegmentBackground
      : terminal.toggle.activeSegmentBackground;
  }};
  border: 1px solid
    ${({ $active, $dark }) => {
      if (!$active) {
        return 'transparent';
      }
      return $dark
        ? editor.surface.activeSegmentBorder
        : terminal.toggle.activeSegmentBorder;
    }};
  border-radius: 6px;
  box-shadow: ${({ $active, $dark }) => {
    if (!$active) {
      return 'none';
    }
    return $dark
      ? editor.surface.activeSegmentShadow
      : terminal.toggle.activeSegmentShadow;
  }};
  color: ${({ $active, $dark }) => {
    if ($dark) {
      return $active ? editor.text.primary : editor.text.dim;
    }
    return $active ? terminal.text.primary : terminal.text.secondary;
  }};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  font-family: ${APP_PREVIEW_STAGE.terminalFont.ui};
  font-size: 13px;
  font-weight: 500;
  gap: 6px;
  height: 24px;
  justify-content: center;
  line-height: 1;
  padding: 0 8px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${({ $active, $dark }) => {
      if ($active) {
        return $dark
          ? editor.surface.activeSegmentBackground
          : terminal.toggle.activeSegmentBackground;
      }
      return $dark
        ? editor.surface.rowHover
        : terminal.toggle.inactiveSegmentHoverBackground;
    }};
    color: ${({ $dark }) =>
      $dark ? editor.text.primary : terminal.text.primary};
  }
`;

const SegmentIconWrap = styled.span`
  align-items: center;
  color: currentColor;
  display: flex;
  flex: 0 0 auto;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

export function TerminalToggle({
  value,
  onChange,
  theme = 'light',
}: {
  value: TerminalView;
  onChange?: (value: TerminalView) => void;
  theme?: 'light' | 'dark';
}) {
  const { i18n } = useLingui();
  const isDark = theme === 'dark';

  return (
    <ToggleRoot
      $dark={isDark}
      role="tablist"
      aria-label={i18n._(msg`Terminal mode`)}
    >
      <SegmentButton
        $active={value === 'editor'}
        $dark={isDark}
        aria-selected={value === 'editor'}
        onClick={() => onChange?.('editor')}
        role="tab"
        type="button"
      >
        <SegmentIconWrap>
          <CursorLogo size={14} />
        </SegmentIconWrap>
        Editor
      </SegmentButton>
      <SegmentButton
        $active={value === 'ai-chat'}
        $dark={isDark}
        aria-selected={value === 'ai-chat'}
        onClick={() => onChange?.('ai-chat')}
        role="tab"
        type="button"
      >
        <SegmentIconWrap>
          <ClaudeMark sizePx={14} />
        </SegmentIconWrap>
        AI Chat
      </SegmentButton>
    </ToggleRoot>
  );
}
