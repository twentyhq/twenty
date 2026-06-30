'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

const ThinkingRoot = styled.div`
  align-items: center;
  display: inline-flex;
  gap: 4px;
  padding: 4px 0;
`;

const ThinkingDot = styled.span<{ $delay: string }>`
  animation: chatThinkingBounce 1.2s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay};
  background: ${APP_PREVIEW_TONES.terminal.text.thinkingDot};
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

export function ThinkingIndicator() {
  const { i18n } = useLingui();

  return (
    <ThinkingRoot aria-label={i18n._(msg`Thinking`)}>
      <ThinkingDot $delay="0s" />
      <ThinkingDot $delay="0.15s" />
      <ThinkingDot $delay="0.3s" />
    </ThinkingRoot>
  );
}
