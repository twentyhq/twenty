'use client';

import { styled } from '@linaria/react';

import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { TerminalPromptFooter } from './terminal-prompt-footer';
import { TerminalPromptMessage } from './terminal-prompt-message';
import { useTerminalPromptEasterEgg } from './use-terminal-prompt-easter-egg';

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

  &[data-wiggle='true'] {
    animation: promptWiggle 0.5s ease;
  }

  @keyframes promptWiggle {
    0%,
    100% {
      transform: translateX(0);
    }
    20% {
      transform: translateX(-3px) rotate(-0.4deg);
    }
    40% {
      transform: translateX(3px) rotate(0.4deg);
    }
    60% {
      transform: translateX(-2px) rotate(-0.2deg);
    }
    80% {
      transform: translateX(2px) rotate(0.2deg);
    }
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
  const {
    easterEggMessage,
    handleAnimationEnd,
    handleClick: handleEasterEggClick,
    isWiggling,
  } = useTerminalPromptEasterEgg({
    enabled: isChatFinished === true,
  });
  const showEasterEgg = easterEggMessage !== null;
  const displayText = easterEggMessage ?? promptText;

  return (
    <PromptArea>
      <PromptBox
        data-wiggle={isWiggling ? 'true' : 'false'}
        onAnimationEnd={handleAnimationEnd}
      >
        <TerminalPromptMessage
          isClickable={isChatFinished}
          isEasterEggVisible={showEasterEgg}
          isPlaceholder={promptIsPlaceholder}
          onClick={handleEasterEggClick}
          text={displayText}
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
