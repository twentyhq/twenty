import type { ConversationMessage } from '../Conversation/types/conversation-message-types';
import type { TerminalToggleValue } from '../types/terminal-toggle-types';
import { INITIAL_PROMPT_TEXT } from './terminal-initial-prompt-text';

export type TerminalConversationState = {
  instantComplete: boolean;
  isChatFinished: boolean;
  isDiffOpen: boolean;
  messages: ConversationMessage[];
  view: TerminalToggleValue;
};

type TerminalConversationAction =
  | { sentAt: number; type: 'send-prompt' }
  | { type: 'change-view'; view: TerminalToggleValue }
  | { type: 'reset' }
  | { type: 'toggle-diff' }
  | { type: 'finish-chat' }
  | { sentAt: number; type: 'jump-to-end' };

export const INITIAL_TERMINAL_CONVERSATION_STATE: TerminalConversationState = {
  instantComplete: false,
  isChatFinished: false,
  isDiffOpen: false,
  messages: [],
  view: 'ai-chat',
};

const createPromptMessages = (sentAt: number): ConversationMessage[] => [
  { id: `u-${sentAt}`, role: 'user', text: INITIAL_PROMPT_TEXT },
  { id: `a-${sentAt}`, role: 'assistant' },
];

export const terminalConversationReducer = (
  state: TerminalConversationState,
  action: TerminalConversationAction,
): TerminalConversationState => {
  switch (action.type) {
    case 'send-prompt': {
      if (state.messages.length > 0) {
        return state;
      }

      return {
        ...state,
        instantComplete: false,
        messages: createPromptMessages(action.sentAt),
      };
    }

    case 'change-view': {
      return {
        ...state,
        view: action.view,
      };
    }

    case 'reset': {
      return INITIAL_TERMINAL_CONVERSATION_STATE;
    }

    case 'toggle-diff': {
      return {
        ...state,
        isDiffOpen: !state.isDiffOpen,
      };
    }

    case 'finish-chat': {
      return {
        ...state,
        isChatFinished: true,
      };
    }

    case 'jump-to-end': {
      return {
        ...state,
        instantComplete: true,
        isChatFinished: true,
        isDiffOpen: false,
        messages:
          state.messages.length > 0
            ? state.messages
            : createPromptMessages(action.sentAt),
        view: 'ai-chat',
      };
    }
  }
};
