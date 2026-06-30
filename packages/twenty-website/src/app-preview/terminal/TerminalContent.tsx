'use client';

import { styled } from '@linaria/react';
import dynamic from 'next/dynamic';
import { useState } from 'react';

import { EASING } from '@/tokens';

import { ConversationPanel } from './ConversationPanel';
import {
  CONVERSATION_CORE,
  type ConversationMessage,
  type TerminalView,
} from './conversation-core';
import { TerminalDiff } from './diff/TerminalDiff';
import { TerminalPromptBox } from './TerminalPromptBox';

// The editor is the terminal's heaviest face and never the landing view:
// it stays a deferred chunk (idle-preloaded by the shell) and mounts on
// the first toggle, staying mounted after so tab state survives.
const TerminalEditor = dynamic(
  () =>
    import('./editor/TerminalEditor').then((module) => module.TerminalEditor),
  { ssr: false },
);

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
  transition: flex-basis 320ms ${EASING.standard};
  width: ${({ $open }) => ($open ? '55%' : '0')};
`;

export function TerminalContent({
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
}: {
  hasStartedConversation: boolean;
  instantComplete: boolean;
  isChatFinished: boolean;
  isDiffOpen: boolean;
  messages: ConversationMessage[];
  onChatFinished: () => void;
  onObjectCreated?: (id: string) => void;
  onResetConversation: () => void;
  onSendPrompt: () => void;
  view: TerminalView;
}) {
  // Render-phase latch: once the editor has been opened it stays mounted
  // so its tab state survives toggling back to chat.
  const [hasOpenedEditor, setHasOpenedEditor] = useState(false);
  if (view === 'editor' && !hasOpenedEditor) {
    setHasOpenedEditor(true);
  }

  return (
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
              hasStartedConversation
                ? CLEARED_PROMPT_TEXT
                : CONVERSATION_CORE.initialPromptText
            }
            sendDisabled={hasStartedConversation}
          />
        </ChatColumn>
        <DiffSlide $open={isChatFinished && isDiffOpen}>
          <TerminalDiff />
        </DiffSlide>
      </ViewLayer>
      <ViewLayer $visible={view === 'editor'}>
        {hasOpenedEditor ? (
          <TerminalEditor showGeneratedFiles={isChatFinished} />
        ) : null}
      </ViewLayer>
    </Body>
  );
}
