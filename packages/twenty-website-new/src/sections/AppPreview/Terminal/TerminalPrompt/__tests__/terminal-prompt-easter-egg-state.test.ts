import {
  getTerminalPromptEasterEggMessage,
  INITIAL_TERMINAL_PROMPT_EASTER_EGG_STATE,
  TERMINAL_PROMPT_EASTER_EGG_MESSAGES,
  terminalPromptEasterEggReducer,
} from '../utils/terminal-prompt-easter-egg-state';

describe('terminalPromptEasterEggReducer', () => {
  it('advances from no easter egg to the first message', () => {
    const state = terminalPromptEasterEggReducer(
      INITIAL_TERMINAL_PROMPT_EASTER_EGG_STATE,
      { type: 'advance' },
    );

    expect(state).toMatchObject({
      escapeClickCount: 1,
      escapeEventCount: 0,
      isWiggling: true,
      messageIndex: 0,
    });
    expect(getTerminalPromptEasterEggMessage(state)).toBe(
      TERMINAL_PROMPT_EASTER_EGG_MESSAGES[0],
    );
  });

  it('cycles through easter egg messages', () => {
    const lastMessageState = {
      ...INITIAL_TERMINAL_PROMPT_EASTER_EGG_STATE,
      messageIndex: TERMINAL_PROMPT_EASTER_EGG_MESSAGES.length - 1,
    };

    expect(
      terminalPromptEasterEggReducer(lastMessageState, {
        type: 'advance',
      }).messageIndex,
    ).toBe(0);
  });

  it('triggers the traffic-light escape event every fifth click', () => {
    const almostReadyState = {
      ...INITIAL_TERMINAL_PROMPT_EASTER_EGG_STATE,
      escapeClickCount: 4,
      escapeEventCount: 2,
    };

    expect(
      terminalPromptEasterEggReducer(almostReadyState, {
        type: 'advance',
      }),
    ).toMatchObject({
      escapeClickCount: 0,
      escapeEventCount: 3,
      isWiggling: true,
      messageIndex: 0,
    });
  });

  it('stops the prompt wiggle without changing the selected message', () => {
    expect(
      terminalPromptEasterEggReducer(
        {
          ...INITIAL_TERMINAL_PROMPT_EASTER_EGG_STATE,
          isWiggling: true,
          messageIndex: 2,
        },
        { type: 'stop-wiggle' },
      ),
    ).toEqual({
      ...INITIAL_TERMINAL_PROMPT_EASTER_EGG_STATE,
      isWiggling: false,
      messageIndex: 2,
    });
  });

  it('resets to the initial state', () => {
    expect(
      terminalPromptEasterEggReducer(
        {
          escapeClickCount: 3,
          escapeEventCount: 1,
          isWiggling: true,
          messageIndex: 4,
        },
        { type: 'reset' },
      ),
    ).toBe(INITIAL_TERMINAL_PROMPT_EASTER_EGG_STATE);
  });
});
