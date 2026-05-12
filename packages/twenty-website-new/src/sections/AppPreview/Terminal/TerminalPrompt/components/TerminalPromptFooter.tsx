import { styled } from '@linaria/react';
import { IconFolder, IconGitBranch } from '@tabler/icons-react';

import { TerminalPromptChip } from './TerminalPromptChip';
import { TerminalSendButton } from './TerminalSendButton';
import { TERMINAL_TOKENS } from '../../utils/terminal-tokens';

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

type TerminalPromptFooterProps = {
  isChatFinished?: boolean;
  onReset?: () => void;
  onSend?: () => void;
  sendDisabled?: boolean;
};

export const TerminalPromptFooter = ({
  isChatFinished,
  onReset,
  onSend,
  sendDisabled,
}: TerminalPromptFooterProps) => (
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
);
