'use client';

import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import { AssistantResponse } from './AssistantResponse';
import { UserMessage } from './UserMessage';

export type ConversationMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant' };

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
`;

export const ConversationPanel = ({
  instantComplete = false,
  messages,
  onUndo,
  onObjectCreated,
  onChatFinished,
}: ConversationPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the view pinned to the bottom as content grows — whether that's a
  // new message landing or the assistant streaming the next character. We
  // watch the subtree for any DOM / text change and coalesce scrolls into a
  // single request per animation frame so streaming stays smooth.
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return undefined;
    }

    let frameId: number | null = null;
    const scheduleScroll = () => {
      if (frameId !== null) {
        return;
      }
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
      });
    };

    scheduleScroll();

    const observer = new MutationObserver(scheduleScroll);
    observer.observe(element, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

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
