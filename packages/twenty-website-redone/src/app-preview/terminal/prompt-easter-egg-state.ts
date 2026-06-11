// The finished-chat prompt egg: poking the done conversation cycles the
// authored lines IN ORDER with a wiggle (the old site coupled a random
// escape here; the escape now belongs to the close dot).
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
  isWiggling: boolean;
  messageIndex: number | null;
};

export type PromptEasterEggAction =
  | { type: 'advance' }
  | { type: 'reset' }
  | { type: 'stop-wiggle' };

const INITIAL_STATE: PromptEasterEggState = {
  isWiggling: false,
  messageIndex: null,
};

const reduce = (
  state: PromptEasterEggState,
  action: PromptEasterEggAction,
): PromptEasterEggState => {
  switch (action.type) {
    case 'advance': {
      return {
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
