const TRAFFIC_LIGHTS_ESCAPE_THRESHOLD = 5;

export const TERMINAL_PROMPT_EASTER_EGG_MESSAGES = [
  'Ask me to do something your CRM should have done years ago',
  'Build the thing your admin said was impossible',
  'Turn this CRM into something actually useful',
  'Ask for a workflow. Not a miracle.',
  'Describe the app you wish you already had',
  'Create a spaceship. Or a sales workflow.',
  'Make Salesforce nervous',
  'Still here? Type the impossible',
  'Describe the tool you were not supposed to have.',
  'Build the thing hidden behind a paywall elsewhere.',
];

export type TerminalPromptEasterEggState = {
  escapeClickCount: number;
  escapeEventCount: number;
  isWiggling: boolean;
  messageIndex: number | null;
};

type TerminalPromptEasterEggAction =
  | { type: 'advance' }
  | { type: 'reset' }
  | { type: 'stop-wiggle' };

export const INITIAL_TERMINAL_PROMPT_EASTER_EGG_STATE: TerminalPromptEasterEggState =
  {
    escapeClickCount: 0,
    escapeEventCount: 0,
    isWiggling: false,
    messageIndex: null,
  };

export const terminalPromptEasterEggReducer = (
  state: TerminalPromptEasterEggState,
  action: TerminalPromptEasterEggAction,
): TerminalPromptEasterEggState => {
  switch (action.type) {
    case 'advance': {
      const nextEscapeClickCount = state.escapeClickCount + 1;
      const shouldTriggerEscape =
        nextEscapeClickCount >= TRAFFIC_LIGHTS_ESCAPE_THRESHOLD;

      return {
        escapeClickCount: shouldTriggerEscape ? 0 : nextEscapeClickCount,
        escapeEventCount: shouldTriggerEscape
          ? state.escapeEventCount + 1
          : state.escapeEventCount,
        isWiggling: true,
        messageIndex:
          state.messageIndex === null
            ? 0
            : (state.messageIndex + 1) %
              TERMINAL_PROMPT_EASTER_EGG_MESSAGES.length,
      };
    }

    case 'reset': {
      return INITIAL_TERMINAL_PROMPT_EASTER_EGG_STATE;
    }

    case 'stop-wiggle': {
      return {
        ...state,
        isWiggling: false,
      };
    }
  }
};

export const getTerminalPromptEasterEggMessage = (
  state: TerminalPromptEasterEggState,
): string | null =>
  state.messageIndex === null
    ? null
    : TERMINAL_PROMPT_EASTER_EGG_MESSAGES[state.messageIndex];
