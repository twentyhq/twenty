import { promptEasterEgg } from './prompt-easter-egg-state';

describe('promptEasterEgg', () => {
  it('should advance from no easter egg to the first message', () => {
    const state = promptEasterEgg.reduce(promptEasterEgg.initialState, {
      type: 'advance',
    });

    expect(state).toEqual({
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

  it('should stop the prompt wiggle without changing the selected message', () => {
    expect(
      promptEasterEgg.reduce(
        {
          isWiggling: true,
          messageIndex: 2,
        },
        { type: 'stop-wiggle' },
      ),
    ).toEqual({
      isWiggling: false,
      messageIndex: 2,
    });
  });

  it('should reset to the initial state', () => {
    expect(
      promptEasterEgg.reduce(
        {
          isWiggling: true,
          messageIndex: 4,
        },
        { type: 'reset' },
      ),
    ).toBe(promptEasterEgg.initialState);
  });
});
