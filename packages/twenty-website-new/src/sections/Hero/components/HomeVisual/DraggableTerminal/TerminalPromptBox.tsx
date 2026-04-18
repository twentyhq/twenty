'use client';

import {
  IconChevronDown,
  IconFolder,
  IconGitBranch,
} from '@tabler/icons-react';
import { styled } from '@linaria/react';
import { TERMINAL_TOKENS } from './terminalTokens';
import { TerminalPromptChip } from './TerminalPromptChip';
import { TerminalSendButton } from './TerminalSendButton';

const PromptArea = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 18px;
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
`;

const PromptTextRow = styled.div`
  align-items: flex-start;
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  padding-left: 6px;
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
  white-space: normal;
  word-break: break-word;
`;

const PromptFooter = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: space-between;
  width: 100%;
`;

const ChipRow = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
`;

const ActionRow = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
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
  return (
    <PromptArea>
      <PromptBox>
        <PromptTextRow>
          <PromptText $isPlaceholder={promptIsPlaceholder}>
            {promptText}
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
            <MythosButton type="button">
              Mythos
              <IconChevronDown aria-hidden size={14} stroke={1.8} />
            </MythosButton>
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
