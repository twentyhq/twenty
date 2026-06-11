import { promptEasterEgg } from './prompt-easter-egg-state';

describe('promptEasterEgg', () => {
  it('should advance from no easter egg to the first message', () => {
    const state = promptEasterEgg.reduce(promptEasterEgg.initialState, {
      type: 'advance',
    });

    expect(state).toMatchObject({
      escapeClickCount: 1,
      escapeEventCount: 0,
      isWiggling: true,
      messageIndex: 0,
    });
    expect(promptEasterEgg.getMessage(state)).toBe(promptEasterEgg.messages[0]);
  });

  it('should cycle through easter egg messages in authored order', () => {
    let state = promptEasterEgg.reduce(promptEasterEgg.initialState, {
      type: 'advance',
    });
    state = promptEasterEgg.reduce(state, { type: 'advance' });

    expect(state.messageIndex).toBe(1);
    expect(promptEasterEgg.getMessage(state)).toBe(promptEasterEgg.messages[1]);

    const lastMessageState = {
      ...promptEasterEgg.initialState,
      messageIndex: promptEasterEgg.messages.length - 1,
    };

    expect(
      promptEasterEgg.reduce(lastMessageState, { type: 'advance' })
        .messageIndex,
    ).toBe(0);
  });

  it('should trigger the traffic-light escape event every fifth click', () => {
    const almostReadyState = {
      ...promptEasterEgg.initialState,
      escapeClickCount: 4,
      escapeEventCount: 2,
    };

    expect(
      promptEasterEgg.reduce(almostReadyState, { type: 'advance' }),
    ).toMatchObject({
      escapeClickCount: 0,
      escapeEventCount: 3,
      isWiggling: true,
      messageIndex: 0,
    });
  });

  it('should stop the prompt wiggle without changing the selected message', () => {
    expect(
      promptEasterEgg.reduce(
        {
          ...promptEasterEgg.initialState,
          isWiggling: true,
          messageIndex: 2,
        },
        { type: 'stop-wiggle' },
      ),
    ).toEqual({
      ...promptEasterEgg.initialState,
      isWiggling: false,
      messageIndex: 2,
    });
  });

  it('should reset to the initial state', () => {
    expect(
      promptEasterEgg.reduce(
        {
          escapeClickCount: 3,
          escapeEventCount: 1,
          isWiggling: true,
          messageIndex: 4,
        },
        { type: 'reset' },
      ),
    ).toBe(promptEasterEgg.initialState);
  });
});
