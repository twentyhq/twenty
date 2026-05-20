'use client';

import { styled } from '@linaria/react';
import { TerminalPromptFooter } from './components/TerminalPromptFooter';
import { TerminalPromptMessage } from './components/TerminalPromptMessage';
import { TERMINAL_TOKENS } from '../utils/terminal-tokens';
import { useTerminalPromptEasterEgg } from './hooks/use-terminal-prompt-easter-egg';

const PromptArea = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 12px;
  width: 100%;
`;

const PromptBox = styled.div`
  background: ${TERMINAL_TOKENS.surface.promptBoxBackground};
  border: 1px solid ${TERMINAL_TOKENS.surface.promptBoxBorder};
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
    background: ${TERMINAL_TOKENS.surface.promptBoxBackgroundHover};
    border-color: ${TERMINAL_TOKENS.surface.promptBoxBorderFocus};
  }

  &:focus-within {
    background: ${TERMINAL_TOKENS.surface.promptBoxBackgroundHover};
    border-color: ${TERMINAL_TOKENS.surface.promptBoxBorderFocus};
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

type TerminalPromptBoxProps = {
  promptText: string;
  promptIsPlaceholder?: boolean;
  onSend?: () => void;
  sendDisabled?: boolean;
  isChatFinished?: boolean;
  onReset?: () => void;
};

export const TerminalPromptBox = ({
  promptText,
  promptIsPlaceholder,
  onSend,
  sendDisabled,
  isChatFinished,
  onReset,
}: TerminalPromptBoxProps) => {
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
};
