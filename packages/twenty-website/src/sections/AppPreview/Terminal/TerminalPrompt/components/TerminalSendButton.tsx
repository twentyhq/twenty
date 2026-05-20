'use client';

import { IconArrowBackUp, IconArrowUp } from '@tabler/icons-react';
import { styled } from '@linaria/react';
import { TerminalSendButtonFingerHint } from './TerminalSendButtonFingerHint';
import { TERMINAL_TOKENS } from '../../utils/terminal-tokens';
import { useTerminalSendButtonHint } from '../hooks/use-terminal-send-button-hint';

type TerminalSendButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  mode?: 'send' | 'reset';
};

const SendButtonWrapper = styled.span`
  display: inline-flex;
  position: relative;
`;

const SendButtonRoot = styled.button<{ $isReset: boolean }>`
  align-items: center;
  background: ${({ $isReset }) =>
    $isReset ? '#5a5a5a' : TERMINAL_TOKENS.accent.brand};
  border: none;
  border-radius: 999px;
  box-shadow: ${({ $isReset }) =>
    $isReset
      ? 'none'
      : '0 0 0 1px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.12)'};
  color: #ffffff;
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
      $isReset ? '#4c4c4c' : TERMINAL_TOKENS.accent.brandHover};
  }

  &:active:not(:disabled) {
    transform: scale(0.94);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

export const TerminalSendButton = ({
  onClick,
  disabled,
  mode = 'send',
}: TerminalSendButtonProps) => {
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
        aria-label={isReset ? 'Reset conversation' : 'Send message'}
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
};
