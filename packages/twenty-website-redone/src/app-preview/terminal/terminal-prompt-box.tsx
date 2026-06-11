import { styled } from '@linaria/react';

import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { TerminalPromptFooter } from './terminal-prompt-footer';
import { TerminalPromptMessage } from './terminal-prompt-message';

const terminal = APP_PREVIEW_TONES.terminal;

const PromptArea = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 12px;
  width: 100%;
`;

const PromptBox = styled.div`
  background: ${terminal.surface.promptBoxBackground};
  border: 1px solid ${terminal.surface.promptBoxBorder};
  border-radius: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: space-between;
  min-height: 120px;
  overflow: hidden;
  padding: 12px;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease;
  width: 100%;

  &:hover {
    background: ${terminal.surface.promptBoxBackgroundHover};
    border-color: ${terminal.surface.promptBoxBorderFocus};
  }

  &:focus-within {
    background: ${terminal.surface.promptBoxBackgroundHover};
    border-color: ${terminal.surface.promptBoxBorderFocus};
  }
`;

export function TerminalPromptBox({
  promptText,
  promptIsPlaceholder,
  onSend,
  sendDisabled,
  isChatFinished,
  onReset,
}: {
  promptText: string;
  promptIsPlaceholder?: boolean;
  onSend?: () => void;
  sendDisabled?: boolean;
  isChatFinished?: boolean;
  onReset?: () => void;
}) {
  return (
    <PromptArea>
      <PromptBox>
        <TerminalPromptMessage
          isPlaceholder={promptIsPlaceholder}
          text={promptText}
        />
        <TerminalPromptFooter
          isChatFinished={isChatFinished}
          onReset={onReset}
          onSend={onSend}
          sendDisabled={sendDisabled}
        />
      </PromptBox>
    </PromptArea>
  );
}
