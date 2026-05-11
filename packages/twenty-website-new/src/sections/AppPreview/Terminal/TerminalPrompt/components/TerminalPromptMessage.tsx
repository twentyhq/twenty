import { styled } from '@linaria/react';

import { TERMINAL_TOKENS } from '../../utils/terminal-tokens';

const PromptTextRow = styled.div<{ $clickable?: boolean }>`
  align-items: flex-start;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  padding-left: 6px;
  user-select: none;
  -webkit-user-select: none;
`;

const PromptText = styled.p<{ $isPlaceholder?: boolean }>`
  color: ${({ $isPlaceholder }) =>
    $isPlaceholder ? TERMINAL_TOKENS.text.muted : TERMINAL_TOKENS.text.prompt};
  font-family: ${TERMINAL_TOKENS.font.ui};
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;
  margin: 0;
  overflow-wrap: anywhere;
  transition: color 0.18s ease;
  white-space: normal;
  word-break: break-word;

  animation: promptTextSwap 0.28s ease;

  @keyframes promptTextSwap {
    0% {
      opacity: 0;
      transform: translateY(4px);
      filter: blur(2px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
      filter: blur(0);
    }
  }
`;

type TerminalPromptMessageProps = {
  isEasterEggVisible: boolean;
  isPlaceholder?: boolean;
  isClickable?: boolean;
  onClick: () => void;
  text: string;
};

export const TerminalPromptMessage = ({
  isClickable,
  isEasterEggVisible,
  isPlaceholder,
  onClick,
  text,
}: TerminalPromptMessageProps) => (
  <PromptTextRow $clickable={isClickable} onClick={onClick}>
    <PromptText
      key={isEasterEggVisible ? `egg-${text}` : 'base'}
      $isPlaceholder={isPlaceholder}
    >
      {text}
    </PromptText>
  </PromptTextRow>
);
