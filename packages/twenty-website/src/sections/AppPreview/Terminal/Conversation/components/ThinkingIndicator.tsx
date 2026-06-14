'use client';

import { styled } from '@linaria/react';

const ThinkingRoot = styled.div`
  align-items: center;
  display: inline-flex;
  gap: 4px;
  padding: 4px 0;
`;

const ThinkingDot = styled.span<{ $delay: string }>`
  animation: chatThinkingBounce 1.2s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay};
  background: rgba(0, 0, 0, 0.45);
  border-radius: 999px;
  display: inline-block;
  height: 5px;
  width: 5px;

  @keyframes chatThinkingBounce {
    0%,
    65%,
    100% {
      opacity: 0.3;
      transform: translateY(0);
    }
    30% {
      opacity: 1;
      transform: translateY(-3px);
    }
  }
`;

export const ThinkingIndicator = () => {
  return (
    <ThinkingRoot aria-label="Thinking">
      <ThinkingDot $delay="0s" />
      <ThinkingDot $delay="0.15s" />
      <ThinkingDot $delay="0.3s" />
    </ThinkingRoot>
  );
};
