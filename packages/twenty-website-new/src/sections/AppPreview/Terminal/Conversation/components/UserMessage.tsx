'use client';

import { styled } from '@linaria/react';
import { TERMINAL_TOKENS } from '../../utils/terminal-tokens';
import { CHAT_TIMINGS } from '../utils/animation-timing';

type UserMessageProps = {
  instant?: boolean;
  text: string;
};

const BubbleRow = styled.div<{ $instant: boolean }>`
  animation: ${({ $instant }) =>
    $instant
      ? 'none'
      : `chatBubbleRise ${CHAT_TIMINGS.bubbleEnterMs}ms cubic-bezier(0.22, 1, 0.36, 1) both`};
  display: flex;
  justify-content: flex-end;
  width: 100%;

  @keyframes chatBubbleRise {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Bubble = styled.div`
  background: rgba(0, 0, 0, 0.055);
  border-radius: 14px;
  color: ${TERMINAL_TOKENS.text.prompt};
  font-family: ${TERMINAL_TOKENS.font.ui};
  font-size: 13px;
  line-height: 18px;
  max-width: 80%;
  padding: 8px 12px;
`;

export const UserMessage = ({ instant = false, text }: UserMessageProps) => {
  return (
    <BubbleRow $instant={instant}>
      <Bubble>{text}</Bubble>
    </BubbleRow>
  );
};
