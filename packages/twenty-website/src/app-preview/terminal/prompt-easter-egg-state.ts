// The finished-chat prompt egg, ported verbatim: poking the done
// conversation cycles the authored lines in order with a wiggle, and
// every fifth poke launches the traffic-light escape.
const TRAFFIC_LIGHTS_ESCAPE_THRESHOLD = 5;

const MESSAGES = [
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

export type PromptEasterEggState = {
  escapeClickCount: number;
  escapeEventCount: number;
  isWiggling: boolean;
  messageIndex: number | null;
};

export type PromptEasterEggAction =
  | { type: 'advance' }
  | { type: 'reset' }
  | { type: 'stop-wiggle' };

const INITIAL_STATE: PromptEasterEggState = {
  escapeClickCount: 0,
  escapeEventCount: 0,
  isWiggling: false,
  messageIndex: null,
};

const reduce = (
  state: PromptEasterEggState,
  action: PromptEasterEggAction,
): PromptEasterEggState => {
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
            : (state.messageIndex + 1) % MESSAGES.length,
      };
    }

    case 'reset': {
      return INITIAL_STATE;
    }

    case 'stop-wiggle': {
      return {
        ...state,
        isWiggling: false,
      };
    }
  }
};

const getMessage = (state: PromptEasterEggState): string | null =>
  state.messageIndex === null ? null : MESSAGES[state.messageIndex];

export const promptEasterEgg = {
  getMessage,
  initialState: INITIAL_STATE,
  messages: MESSAGES,
  reduce,
};
