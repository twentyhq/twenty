import { styled } from '@linaria/react';

import { EASING } from '@/tokens';
import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { CONVERSATION_CORE } from './conversation-core';

const BubbleRow = styled.div<{ $instant: boolean }>`
  animation: ${({ $instant }) =>
    $instant
      ? 'none'
      : `chatBubbleRise ${CONVERSATION_CORE.timings.bubbleEnterMs}ms ${EASING.standard} both`};
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
  background: ${APP_PREVIEW_TONES.terminal.surface.bubble};
  border-radius: 14px;
  color: ${APP_PREVIEW_TONES.terminal.text.prompt};
  font-family: ${APP_PREVIEW_STAGE.terminalFont.ui};
  font-size: 13px;
  line-height: 18px;
  max-width: 80%;
  padding: 8px 12px;
`;

export function UserMessage({
  instant = false,
  text,
}: {
  instant?: boolean;
  text: string;
}) {
  return (
    <BubbleRow $instant={instant}>
      <Bubble>{text}</Bubble>
    </BubbleRow>
  );
}
