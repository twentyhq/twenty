'use client';

import { styled } from '@linaria/react';
import { useCallback, useEffect } from 'react';

import { scheduleIdleTask } from '@/platform/motion';

import { mediaUp } from '@/tokens';
import { APP_PREVIEW_MOTION } from '@/tokens/app-preview/app-preview-motion';
import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { type TerminalView } from './conversation-core';
import { TerminalContent } from './terminal-content';
import { TerminalResizeHandles } from './terminal-resize-handles';
import { TerminalTopBar } from './terminal-top-bar';
import { useTerminalConversationWorkflow } from './use-terminal-conversation-workflow';
import { useTerminalWindowLayout } from './use-terminal-window-layout';

const Shell = styled.div<{
  $isDragging: boolean;
  $isResizing: boolean;
  $isReady: boolean;
  $animationsEnabled: boolean;
  $dark: boolean;
}>`
  background: ${({ $dark }) =>
    $dark
      ? APP_PREVIEW_TONES.editor.surface.body
      : APP_PREVIEW_TONES.terminal.surface.window};
  border: 1px solid ${APP_PREVIEW_TONES.terminal.surface.windowBorder};
  border-radius: 20px;
  box-shadow: ${({ $isDragging, $isResizing }) =>
    $isDragging || $isResizing
      ? APP_PREVIEW_STAGE.shadow.mobileElevated
      : APP_PREVIEW_STAGE.shadow.mobileResting};
  display: none;
  flex-direction: column;
  left: 0;
  opacity: ${({ $isReady }) => ($isReady ? 1 : 0)};
  overflow: hidden;
  position: absolute;
  top: 0;
  touch-action: none;

  ${APP_PREVIEW_STAGE.terminalRoomQuery} {
    display: flex;
  }

  ${mediaUp('md')} {
    box-shadow: ${({ $isDragging, $isResizing }) =>
      $isDragging || $isResizing
        ? APP_PREVIEW_STAGE.shadow.elevated
        : APP_PREVIEW_STAGE.shadow.resting};
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
    const springCurve = APP_PREVIEW_MOTION.windowSpringEase;
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

export function Terminal({
  onObjectCreated,
  onChatFinished,
  onChatReset,
  onJumpToConversationEnd,
}: {
  onObjectCreated?: (id: string) => void;
  onChatFinished?: () => void;
  onChatReset?: () => void;
  onJumpToConversationEnd?: () => void;
}) {
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

  // The editor chunk loads in idle time so the first toggle is instant.
  useEffect(
    () =>
      scheduleIdleTask(() => {
        void import('./editor/terminal-editor');
      }),
    [],
  );
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
    (next: TerminalView) => {
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
}
