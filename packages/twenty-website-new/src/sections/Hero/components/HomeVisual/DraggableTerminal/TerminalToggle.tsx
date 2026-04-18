'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';
import { ClaudeLogo } from './ClaudeLogo';
import { CursorLogo } from './CursorLogo';
import { EDITOR_TOKENS } from './TerminalEditor/editorTokens';
import { TERMINAL_TOKENS } from './terminalTokens';

export type TerminalToggleValue = 'editor' | 'ai-chat';

type TerminalToggleProps = {
  value?: TerminalToggleValue;
  onChange?: (value: TerminalToggleValue) => void;
  editorDisabled?: boolean;
  theme?: 'light' | 'dark';
};

const ToggleRoot = styled.div<{ $dark?: boolean }>`
  align-items: center;
  background: ${({ $dark }) =>
    $dark
      ? EDITOR_TOKENS.surface.toggleBackground
      : TERMINAL_TOKENS.surface.toggleBackground};
  border: 1px solid
    ${({ $dark }) =>
      $dark
        ? EDITOR_TOKENS.surface.toggleBorder
        : TERMINAL_TOKENS.surface.toggleBorder};
  border-radius: 6px;
  box-sizing: border-box;
  display: flex;
  gap: 2px;
  height: 24px;
  padding: 0;
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
      ? EDITOR_TOKENS.surface.activeSegmentBackground
      : TERMINAL_TOKENS.surface.activeSegmentBackground;
  }};
  border: 1px solid
    ${({ $active, $dark }) => {
      if (!$active) {
        return 'transparent';
      }
      return $dark
        ? EDITOR_TOKENS.surface.activeSegmentBorder
        : TERMINAL_TOKENS.surface.activeSegmentBorder;
    }};
  border-radius: 6px;
  box-shadow: ${({ $active, $dark }) => {
    if (!$active) {
      return 'none';
    }
    return $dark
      ? EDITOR_TOKENS.shadow.activeSegment
      : TERMINAL_TOKENS.shadow.activeSegment;
  }};
  color: ${({ $active, $dark }) => {
    if ($dark) {
      return $active ? EDITOR_TOKENS.text.primary : EDITOR_TOKENS.text.dim;
    }
    return $active
      ? TERMINAL_TOKENS.text.primary
      : TERMINAL_TOKENS.text.secondary;
  }};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  font-family: ${TERMINAL_TOKENS.font.ui};
  font-size: 13px;
  font-weight: 500;
  gap: 6px;
  height: 22px;
  justify-content: center;
  line-height: 1;
  padding: 0 8px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    opacity 0.14s ease;
  white-space: nowrap;

  &:hover {
    background: ${({ $active, $dark }) => {
      if ($active) {
        return $dark
          ? EDITOR_TOKENS.surface.activeSegmentBackground
          : TERMINAL_TOKENS.surface.activeSegmentBackground;
      }
      return $dark
        ? 'rgba(255, 255, 255, 0.04)'
        : TERMINAL_TOKENS.surface.inactiveSegmentHoverBackground;
    }};
    color: ${({ $dark }) =>
      $dark ? EDITOR_TOKENS.text.primary : TERMINAL_TOKENS.text.primary};
  }

  &:disabled {
    background: transparent;
    color: ${({ $dark }) =>
      $dark ? EDITOR_TOKENS.text.dim : TERMINAL_TOKENS.text.secondary};
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:disabled:hover {
    background: transparent;
    color: ${({ $dark }) =>
      $dark ? EDITOR_TOKENS.text.dim : TERMINAL_TOKENS.text.secondary};
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

export const TerminalToggle = ({
  value: controlledValue,
  onChange,
  editorDisabled,
  theme = 'light',
}: TerminalToggleProps) => {
  const [internalValue, setInternalValue] =
    useState<TerminalToggleValue>('ai-chat');
  const value = controlledValue ?? internalValue;
  const isDark = theme === 'dark';

  const selectSegment = (nextValue: TerminalToggleValue) => () => {
    if (controlledValue === undefined) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  };

  return (
    <ToggleRoot $dark={isDark} role="tablist" aria-label="Terminal mode">
      <SegmentButton
        $active={value === 'editor'}
        $dark={isDark}
        aria-selected={value === 'editor'}
        aria-disabled={editorDisabled}
        disabled={editorDisabled}
        onClick={selectSegment('editor')}
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
        onClick={selectSegment('ai-chat')}
        role="tab"
        type="button"
      >
        <SegmentIconWrap>
          <ClaudeLogo size={14} />
        </SegmentIconWrap>
        Chat
      </SegmentButton>
    </ToggleRoot>
  );
};
