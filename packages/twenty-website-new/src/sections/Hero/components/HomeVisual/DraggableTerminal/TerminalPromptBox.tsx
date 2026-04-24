'use client';

import { IconFolder, IconGitBranch } from '@tabler/icons-react';
import { styled } from '@linaria/react';
import { useEffect, useState } from 'react';
import { TERMINAL_TOKENS } from './terminalTokens';
import { TerminalPromptChip } from './TerminalPromptChip';
import { TerminalSendButton } from './TerminalSendButton';
import { TRAFFIC_LIGHTS_ESCAPE_EVENT } from './TerminalTrafficLights';

const TRAFFIC_LIGHTS_ESCAPE_THRESHOLD = 5;

const EASTER_EGG_MESSAGES = [
  'Ask me to do something your CRM should have done years ago',
  'Build the thing your admin said was impossible',
  'Turn this CRM into something actually useful',
  'Ask for a workflow. Not a miracle.',
  'Describe the app you wish you already had',
  'Create a spaceship. Or a sales workflow.',
  'Make Salesforce nervous',
  'Still here? Type the impossible',
  'Describe the tool you were not supposed to have.',
  'Build the thing hidden behind a paywall elsewhere.',
];

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

const PromptFooter = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  width: 100%;
`;

const ChipRow = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  gap: 8px;
  min-width: 0;
`;

const ActionRow = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  margin-left: auto;
`;

const MythosButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: ${TERMINAL_TOKENS.text.muted};
  cursor: pointer;
  display: flex;
  font-family: ${TERMINAL_TOKENS.font.mono};
  font-size: 13px;
  font-weight: 400;
  gap: 4px;
  height: 24px;
  line-height: 1.4;
  padding: 0 8px;
  transition:
    background-color 0.14s ease,
    color 0.14s ease;
  white-space: nowrap;

  &:hover {
    background: ${TERMINAL_TOKENS.surface.mythosHoverBackground};
    color: ${TERMINAL_TOKENS.text.mutedHover};
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
  const [easterEggIndex, setEasterEggIndex] = useState<number | null>(null);
  const [isWiggling, setIsWiggling] = useState(false);
  const [, setClickCount] = useState(0);

  useEffect(() => {
    if (!isChatFinished) {
      setEasterEggIndex(null);
      setIsWiggling(false);
      setClickCount(0);
    }
  }, [isChatFinished]);

  const handleEasterEggClick = () => {
    if (!isChatFinished) {
      return;
    }
    setEasterEggIndex((prev) =>
      prev === null ? 0 : (prev + 1) % EASTER_EGG_MESSAGES.length,
    );
    setIsWiggling(true);
    window.setTimeout(() => setIsWiggling(false), 500);

    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= TRAFFIC_LIGHTS_ESCAPE_THRESHOLD) {
        window.dispatchEvent(new CustomEvent(TRAFFIC_LIGHTS_ESCAPE_EVENT));
        return 0;
      }
      return next;
    });
  };

  const showEasterEgg = isChatFinished && easterEggIndex !== null;
  const displayText = showEasterEgg
    ? EASTER_EGG_MESSAGES[easterEggIndex]
    : promptText;

  return (
    <PromptArea>
      <PromptBox data-wiggle={isWiggling ? 'true' : 'false'}>
        <PromptTextRow
          $clickable={isChatFinished}
          onClick={handleEasterEggClick}
        >
          <PromptText
            key={showEasterEgg ? `egg-${easterEggIndex}` : 'base'}
            $isPlaceholder={promptIsPlaceholder}
          >
            {displayText}
          </PromptText>
        </PromptTextRow>
        <PromptFooter>
          <ChipRow>
            <TerminalPromptChip
              icon={<IconFolder size={13} stroke={1.8} />}
              label="~/code/my-twenty-app"
            />
            <TerminalPromptChip
              icon={<IconGitBranch size={13} stroke={1.8} />}
              label="main"
            />
          </ChipRow>
          <ActionRow>
            <MythosButton type="button">Mythos</MythosButton>
            <TerminalSendButton
              disabled={isChatFinished ? false : sendDisabled}
              mode={isChatFinished ? 'reset' : 'send'}
              onClick={isChatFinished ? onReset : onSend}
            />
          </ActionRow>
        </PromptFooter>
      </PromptBox>
    </PromptArea>
  );
};
