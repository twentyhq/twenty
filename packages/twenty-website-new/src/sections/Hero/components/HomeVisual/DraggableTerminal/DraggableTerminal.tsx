'use client';

import { styled } from '@linaria/react';
import { useCallback } from 'react';
import { theme } from '@/theme';
import { WINDOW_SHADOWS } from '../Shared/utils/window-shadows';
import { EDITOR_TOKENS } from './TerminalEditor/utils/editor-tokens';
import { TerminalContent } from './components/TerminalContent';
import { TerminalResizeHandles } from './components/TerminalResizeHandles';
import { TerminalTopBar } from './components/TerminalTopBar';
import { useTerminalConversationWorkflow } from './hooks/use-terminal-conversation-workflow';
import { useTerminalWindowLayout } from './hooks/use-terminal-window-layout';
import type { TerminalToggleValue } from './types/terminal-toggle-types';
import { TERMINAL_TOKENS } from './utils/terminal-tokens';

const Shell = styled.div<{
  $isDragging: boolean;
  $isResizing: boolean;
  $isReady: boolean;
  $animationsEnabled: boolean;
  $dark: boolean;
}>`
  background: ${({ $dark }) =>
    $dark ? EDITOR_TOKENS.surface.body : TERMINAL_TOKENS.surface.window};
  border: 1px solid ${TERMINAL_TOKENS.surface.windowBorder};
  border-radius: 20px;
  box-shadow: ${({ $isDragging, $isResizing }) =>
    $isDragging || $isResizing
      ? WINDOW_SHADOWS.mobileElevated
      : WINDOW_SHADOWS.mobileResting};
  display: flex;
  flex-direction: column;
  left: 0;
  opacity: ${({ $isReady }) => ($isReady ? 1 : 0)};
  overflow: hidden;
  position: absolute;
  top: 0;
  touch-action: none;

  @media (min-width: ${theme.breakpoints.md}px) {
    box-shadow: ${({ $isDragging, $isResizing }) =>
      $isDragging || $isResizing
        ? WINDOW_SHADOWS.elevated
        : WINDOW_SHADOWS.resting};
  }
  transition: ${({ $isDragging, $isResizing, $animationsEnabled }) => {
    if ($isDragging || $isResizing) {
      return 'background-color 0.22s ease, box-shadow 0.14s ease, opacity 0.1s ease';
    }
    const base =
      'background-color 0.22s ease, box-shadow 0.22s ease, opacity 0.1s ease';
    if (!$animationsEnabled) {
      return base;
    }
    const springCurve = 'cubic-bezier(0.34, 1.45, 0.55, 1)';
    const growDuration = '0.42s';
    return `${base}, height ${growDuration} ${springCurve}, width ${growDuration} ${springCurve}, transform ${growDuration} ${springCurve}`;
  }};
  will-change: transform, width, height;

  @media (prefers-reduced-motion: reduce) {
    /* Drop the decorative spring grow; keep the colour / shadow / opacity
       acknowledgement transitions, which are functional feedback. */
    transition:
      background-color 0.22s ease,
      box-shadow 0.22s ease,
      opacity 0.1s ease;
  }
`;

type DraggableTerminalProps = {
  onObjectCreated?: (id: string) => void;
  onChatFinished?: () => void;
  onChatReset?: () => void;
  onJumpToConversationEnd?: () => void;
};

export const DraggableTerminal = ({
  onObjectCreated,
  onChatFinished,
  onChatReset,
  onJumpToConversationEnd,
}: DraggableTerminalProps) => {
  const {
    changeView,
    finishChat,
    hasStartedConversation,
    instantComplete,
    isChatFinished,
    isDiffOpen,
    jumpToConversationEnd,
    messages,
    resetConversation,
    sendPrompt,
    toggleDiff,
    view,
  } = useTerminalConversationWorkflow({
    onChatFinished,
    onChatReset,
    onJumpToConversationEnd,
  });
  const {
    activate,
    animationsEnabled,
    handleDragStart,
    isDragging,
    isReady,
    isResizing,
    resizeToTerminalTarget,
    shellRef,
    startResize,
    windowStyle,
  } = useTerminalWindowLayout();

  const handleSendPrompt = useCallback(() => {
    if (!sendPrompt()) {
      return;
    }

    if (view === 'ai-chat') {
      resizeToTerminalTarget({
        chatStarted: true,
        view: 'ai-chat',
      });
    }
  }, [resizeToTerminalTarget, sendPrompt, view]);

  const handleViewChange = useCallback(
    (next: TerminalToggleValue) => {
      changeView(next);
      resizeToTerminalTarget({
        chatStarted: hasStartedConversation,
        view: next,
      });
    },
    [changeView, hasStartedConversation, resizeToTerminalTarget],
  );

  const handleResetConversation = useCallback(() => {
    resetConversation();
    resizeToTerminalTarget({
      chatStarted: false,
      view: 'ai-chat',
    });
  }, [resetConversation, resizeToTerminalTarget]);

  const handleJumpToConversationEnd = useCallback(() => {
    jumpToConversationEnd();
    resizeToTerminalTarget({
      chatStarted: true,
      view: 'ai-chat',
    });
  }, [jumpToConversationEnd, resizeToTerminalTarget]);

  return (
    <Shell
      $animationsEnabled={animationsEnabled}
      $dark={view === 'editor'}
      $isDragging={isDragging}
      $isResizing={isResizing}
      $isReady={isReady}
      data-terminal-shell="true"
      onPointerDown={activate}
      ref={shellRef}
      style={windowStyle}
    >
      <TerminalResizeHandles onStartResize={startResize} />
      <TerminalTopBar
        diffOpen={isDiffOpen}
        diffVisible={isChatFinished}
        isDragging={isDragging}
        onDragStart={handleDragStart}
        onToggleDiff={toggleDiff}
        onViewChange={handleViewChange}
        onZoomTripleClick={handleJumpToConversationEnd}
        view={view}
      />
      <TerminalContent
        hasStartedConversation={hasStartedConversation}
        instantComplete={instantComplete}
        isChatFinished={isChatFinished}
        isDiffOpen={isDiffOpen}
        messages={messages}
        onChatFinished={finishChat}
        onObjectCreated={onObjectCreated}
        onResetConversation={handleResetConversation}
        onSendPrompt={handleSendPrompt}
        view={view}
      />
    </Shell>
  );
};
