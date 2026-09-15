import {
  CONVERSATION_CORE,
  type ConversationMessage,
  type TerminalView,
} from './conversation-core';

export type TerminalConversationState = {
  instantComplete: boolean;
  isChatFinished: boolean;
  isDiffOpen: boolean;
  messages: ConversationMessage[];
  view: TerminalView;
};

export type TerminalConversationAction =
  | { sentAt: number; type: 'send-prompt' }
  | { type: 'change-view'; view: TerminalView }
  | { type: 'reset' }
  | { type: 'toggle-diff' }
  | { type: 'finish-chat' }
  | { sentAt: number; type: 'jump-to-end' };

const INITIAL_STATE: TerminalConversationState = {
  instantComplete: false,
  isChatFinished: false,
  isDiffOpen: false,
  messages: [],
  view: 'ai-chat',
};

const createPromptMessages = (sentAt: number): ConversationMessage[] => [
  {
    id: `u-${sentAt}`,
    role: 'user',
    text: CONVERSATION_CORE.initialPromptText,
  },
  { id: `a-${sentAt}`, role: 'assistant' },
];

const reduce = (
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
      return INITIAL_STATE;
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

export const terminalConversation = {
  initialState: INITIAL_STATE,
  reduce,
};
