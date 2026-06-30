'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { IconArrowBackUp, IconArrowUp } from '@tabler/icons-react';

import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { TerminalSendButtonFingerHint } from './TerminalSendButtonFingerHint';
import { useTerminalSendButtonHint } from './use-terminal-send-button-hint';

const terminal = APP_PREVIEW_TONES.terminal;

const SendButtonWrapper = styled.span`
  display: inline-flex;
  position: relative;
`;

const SendButtonRoot = styled.button<{ $isReset: boolean }>`
  align-items: center;
  background: ${({ $isReset }) =>
    $isReset ? terminal.accent.reset : terminal.accent.brand};
  border: none;
  border-radius: 999px;
  box-shadow: ${({ $isReset }) =>
    $isReset ? 'none' : terminal.accent.sendShadow};
  color: ${terminal.accent.onAccent};
  cursor: pointer;
  display: flex;
  flex: 0 0 auto;
  height: 32px;
  justify-content: center;
  padding: 0 4px;
  transition:
    background-color 0.14s ease,
    transform 0.12s ease;
  width: 32px;

  &:hover:not(:disabled) {
    background: ${({ $isReset }) =>
      $isReset ? terminal.accent.resetHover : terminal.accent.brandHover};
  }

  &:active:not(:disabled) {
    transform: scale(0.94);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

export function TerminalSendButton({
  onClick,
  disabled,
  mode = 'send',
}: {
  onClick?: () => void;
  disabled?: boolean;
  mode?: 'send' | 'reset';
}) {
  const { i18n } = useLingui();
  const isReset = mode === 'reset';
  const { buttonRef, dismissHint, hintPosition, hintReady, showHint } =
    useTerminalSendButtonHint({
      disabled,
      isReset,
    });

  return (
    <SendButtonWrapper>
      <SendButtonRoot
        $isReset={isReset}
        aria-label={
          isReset ? i18n._(msg`Reset conversation`) : i18n._(msg`Send message`)
        }
        disabled={disabled}
        onClick={() => {
          dismissHint();
          onClick?.();
        }}
        onMouseEnter={dismissHint}
        ref={buttonRef}
        type="button"
      >
        {isReset ? (
          <IconArrowBackUp size={16} stroke={2.2} />
        ) : (
          <IconArrowUp size={16} stroke={2.2} />
        )}
      </SendButtonRoot>
      <TerminalSendButtonFingerHint
        position={hintPosition}
        ready={hintReady}
        visible={showHint}
      />
    </SendButtonWrapper>
  );
}
