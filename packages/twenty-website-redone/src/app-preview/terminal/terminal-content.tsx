import { styled } from '@linaria/react';

import { ConversationPanel } from './conversation-panel';
import {
  CONVERSATION_CORE,
  type ConversationMessage,
} from './conversation-core';
import { TerminalPromptBox } from './terminal-prompt-box';

const CLEARED_PROMPT_TEXT = 'Ask anything…';

// The editor layer and diff slide arrive with the editor commit; until
// then the body hosts the single chat column.
const Body = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 0;
  position: relative;
  width: 100%;
`;

const ChatColumn = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 0;
  min-width: 0;
`;

export function TerminalContent({
  hasStartedConversation,
  instantComplete,
  isChatFinished,
  messages,
  onChatFinished,
  onObjectCreated,
  onResetConversation,
  onSendPrompt,
}: {
  hasStartedConversation: boolean;
  instantComplete: boolean;
  isChatFinished: boolean;
  messages: ConversationMessage[];
  onChatFinished: () => void;
  onObjectCreated?: (id: string) => void;
  onResetConversation: () => void;
  onSendPrompt: () => void;
}) {
  return (
    <Body>
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
            hasStartedConversation
              ? CLEARED_PROMPT_TEXT
              : CONVERSATION_CORE.initialPromptText
          }
          sendDisabled={hasStartedConversation}
        />
      </ChatColumn>
    </Body>
  );
}
