import { useCallback, useReducer, useRef } from 'react';

import type { TerminalToggleValue } from '../types/terminal-toggle-types';
import {
  INITIAL_TERMINAL_CONVERSATION_STATE,
  terminalConversationReducer,
} from '../utils/terminal-conversation-state';

type UseTerminalConversationWorkflowOptions = {
  onChatFinished?: () => void;
  onChatReset?: () => void;
  onJumpToConversationEnd?: () => void;
};

export const useTerminalConversationWorkflow = ({
  onChatFinished,
  onChatReset,
  onJumpToConversationEnd,
}: UseTerminalConversationWorkflowOptions) => {
  const [state, dispatch] = useReducer(
    terminalConversationReducer,
    INITIAL_TERMINAL_CONVERSATION_STATE,
  );
  const hasAnnouncedChatFinishedRef = useRef(false);
  const hasStartedConversation = state.messages.length > 0;

  const announceChatFinishedOnce = useCallback(() => {
    if (hasAnnouncedChatFinishedRef.current) {
      return;
    }

    hasAnnouncedChatFinishedRef.current = true;
    onChatFinished?.();
  }, [onChatFinished]);

  const sendPrompt = useCallback((): boolean => {
    if (state.messages.length > 0) {
      return false;
    }

    dispatch({ type: 'send-prompt', sentAt: Date.now() });
    return true;
  }, [state.messages.length]);

  const changeView = useCallback((view: TerminalToggleValue) => {
    dispatch({ type: 'change-view', view });
  }, []);

  const resetConversation = useCallback(() => {
    hasAnnouncedChatFinishedRef.current = false;
    dispatch({ type: 'reset' });
    onChatReset?.();
  }, [onChatReset]);

  const toggleDiff = useCallback(() => {
    dispatch({ type: 'toggle-diff' });
  }, []);

  const finishChat = useCallback(() => {
    dispatch({ type: 'finish-chat' });
    announceChatFinishedOnce();
  }, [announceChatFinishedOnce]);

  const jumpToConversationEnd = useCallback(() => {
    dispatch({ type: 'jump-to-end', sentAt: Date.now() });
    onJumpToConversationEnd?.();
    announceChatFinishedOnce();
  }, [announceChatFinishedOnce, onJumpToConversationEnd]);

  return {
    ...state,
    changeView,
    finishChat,
    hasStartedConversation,
    jumpToConversationEnd,
    resetConversation,
    sendPrompt,
    toggleDiff,
  };
};
