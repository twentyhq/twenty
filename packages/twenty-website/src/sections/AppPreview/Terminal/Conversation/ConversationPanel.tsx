'use client';

import { styled } from '@linaria/react';
import { AssistantResponse } from './components/AssistantResponse';
import type { ConversationMessage } from './types/conversation-message-types';
import { useConversationAutoScroll } from './hooks/use-conversation-auto-scroll';
import { UserMessage } from './components/UserMessage';

type ConversationPanelProps = {
  instantComplete?: boolean;
  messages: ConversationMessage[];
  onUndo?: () => void;
  onObjectCreated?: (id: string) => void;
  onChatFinished?: () => void;
};

const PanelRoot = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 18px;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 12px 12px 4px;
  scroll-behavior: smooth;
  scrollbar-gutter: stable both-edges;
  width: 100%;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 999px;
  }

  @media (prefers-reduced-motion: reduce) {
    /* Auto-scroll on new messages still happens (functional); only the
       smooth-scroll easing is dropped. */
    scroll-behavior: auto;
  }
`;

export const ConversationPanel = ({
  instantComplete = false,
  messages,
  onUndo,
  onObjectCreated,
  onChatFinished,
}: ConversationPanelProps) => {
  const scrollRef = useConversationAutoScroll();

  return (
    <PanelRoot ref={scrollRef}>
      {messages.map((message) =>
        message.role === 'user' ? (
          <UserMessage
            instant={instantComplete}
            key={message.id}
            text={message.text}
          />
        ) : (
          <AssistantResponse
            instantComplete={instantComplete}
            key={message.id}
            onUndo={onUndo}
            onObjectCreated={onObjectCreated}
            onChatFinished={onChatFinished}
          />
        ),
      )}
    </PanelRoot>
  );
};
