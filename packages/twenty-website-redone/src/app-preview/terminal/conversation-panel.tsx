'use client';

import { styled } from '@linaria/react';

import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { AssistantResponse } from './assistant-response';
import { type ConversationMessage } from './conversation-core';
import { useConversationAutoScroll } from './use-conversation-auto-scroll';
import { UserMessage } from './user-message';

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
    background: ${APP_PREVIEW_TONES.terminal.surface.scrollbarThumb};
    border-radius: 999px;
  }

  @media (prefers-reduced-motion: reduce) {
    /* Auto-scroll on new messages still happens (functional); only the
       smooth-scroll easing is dropped. */
    scroll-behavior: auto;
  }
`;

export function ConversationPanel({
  instantComplete = false,
  messages,
  onUndo,
  onObjectCreated,
  onChatFinished,
}: {
  instantComplete?: boolean;
  messages: ConversationMessage[];
  onUndo?: () => void;
  onObjectCreated?: (id: string) => void;
  onChatFinished?: () => void;
}) {
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
}
