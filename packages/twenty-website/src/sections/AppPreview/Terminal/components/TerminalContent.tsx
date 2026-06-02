import { styled } from '@linaria/react';
import type { ConversationMessage } from '../Conversation/types/conversation-message-types';
import { ConversationPanel } from '../Conversation/ConversationPanel';
import { TerminalDiff } from '../TerminalDiff/TerminalDiff';
import { TerminalEditor } from '../TerminalEditor/TerminalEditor';
import { TerminalPromptBox } from '../TerminalPrompt/TerminalPromptBox';
import type { TerminalToggleValue } from '../types/terminal-toggle-types';
import { INITIAL_PROMPT_TEXT } from '../utils/terminal-initial-prompt-text';

const CLEARED_PROMPT_TEXT = 'Ask anything…';

const Body = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 0;
  position: relative;
  width: 100%;
`;

const ViewLayer = styled.div<{ $visible: boolean; $row?: boolean }>`
  display: flex;
  flex-direction: ${({ $row }) => ($row ? 'row' : 'column')};
  inset: 0;
  justify-content: ${({ $row }) => ($row ? 'flex-start' : 'flex-end')};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  position: absolute;
  transition: opacity 220ms ease;
`;

const ChatColumn = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 0;
  min-width: 0;
`;

const DiffSlide = styled.div<{ $open: boolean }>`
  display: flex;
  flex: 0 0 ${({ $open }) => ($open ? '55%' : '0')};
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  transition: flex-basis 320ms cubic-bezier(0.22, 1, 0.36, 1);
  width: ${({ $open }) => ($open ? '55%' : '0')};
`;

type TerminalContentProps = {
  hasStartedConversation: boolean;
  instantComplete: boolean;
  isChatFinished: boolean;
  isDiffOpen: boolean;
  messages: ConversationMessage[];
  onChatFinished: () => void;
  onObjectCreated?: (id: string) => void;
  onResetConversation: () => void;
  onSendPrompt: () => void;
  view: TerminalToggleValue;
};

export const TerminalContent = ({
  hasStartedConversation,
  instantComplete,
  isChatFinished,
  isDiffOpen,
  messages,
  onChatFinished,
  onObjectCreated,
  onResetConversation,
  onSendPrompt,
  view,
}: TerminalContentProps) => (
  <Body>
    <ViewLayer $row $visible={view === 'ai-chat'}>
      <ChatColumn>
        {hasStartedConversation ? (
          <ConversationPanel
            instantComplete={instantComplete}
            messages={messages}
            onUndo={onResetConversation}
            onObjectCreated={onObjectCreated}
            onChatFinished={onChatFinished}
          />
        ) : null}
        <TerminalPromptBox
          isChatFinished={isChatFinished}
          onReset={onResetConversation}
          onSend={onSendPrompt}
          promptIsPlaceholder={hasStartedConversation}
          promptText={
            hasStartedConversation ? CLEARED_PROMPT_TEXT : INITIAL_PROMPT_TEXT
          }
          sendDisabled={hasStartedConversation}
        />
      </ChatColumn>
      <DiffSlide $open={isChatFinished && isDiffOpen}>
        <TerminalDiff />
      </DiffSlide>
    </ViewLayer>
    <ViewLayer $visible={view === 'editor'}>
      <TerminalEditor showGeneratedFiles={isChatFinished} />
    </ViewLayer>
  </Body>
);
