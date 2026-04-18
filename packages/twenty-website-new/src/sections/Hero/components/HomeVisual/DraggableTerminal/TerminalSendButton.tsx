'use client';

import { IconArrowUp, IconRefresh } from '@tabler/icons-react';
import { styled } from '@linaria/react';
import { TERMINAL_TOKENS } from './terminalTokens';

type TerminalSendButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  mode?: 'send' | 'reset';
};

const SendButtonRoot = styled.button`
  align-items: center;
  background: ${TERMINAL_TOKENS.accent.brand};
  border: none;
  border-radius: 999px;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.12);
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
    background: ${TERMINAL_TOKENS.accent.brandHover};
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
  return (
    <SendButtonRoot
      aria-label={isReset ? 'Reset conversation' : 'Send message'}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {isReset ? (
        <IconRefresh size={16} stroke={2.2} />
      ) : (
        <IconArrowUp size={16} stroke={2.2} />
      )}
    </SendButtonRoot>
  );
};
