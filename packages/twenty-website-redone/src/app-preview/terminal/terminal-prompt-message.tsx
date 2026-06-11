import { styled } from '@linaria/react';

import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

const PromptTextRow = styled.div`
  align-items: flex-start;
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  padding-left: 6px;
  user-select: none;
  -webkit-user-select: none;
`;

const PromptText = styled.p<{ $isPlaceholder?: boolean }>`
  color: ${({ $isPlaceholder }) =>
    $isPlaceholder
      ? APP_PREVIEW_TONES.terminal.text.muted
      : APP_PREVIEW_TONES.terminal.text.prompt};
  font-family: ${APP_PREVIEW_STAGE.terminalFont.ui};
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

export function TerminalPromptMessage({
  isPlaceholder,
  text,
}: {
  isPlaceholder?: boolean;
  text: string;
}) {
  return (
    <PromptTextRow>
      <PromptText $isPlaceholder={isPlaceholder}>{text}</PromptText>
    </PromptTextRow>
  );
}
