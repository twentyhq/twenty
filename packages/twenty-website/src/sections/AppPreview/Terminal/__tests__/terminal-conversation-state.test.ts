import {
  INITIAL_TERMINAL_CONVERSATION_STATE,
  terminalConversationReducer,
} from '../utils/terminal-conversation-state';

describe('terminalConversationReducer', () => {
  it('creates one user message and one assistant message when sending a prompt', () => {
    expect(
      terminalConversationReducer(INITIAL_TERMINAL_CONVERSATION_STATE, {
        type: 'send-prompt',
        sentAt: 123,
      }),
    ).toMatchObject({
      instantComplete: false,
      messages: [
        { id: 'u-123', role: 'user' },
        { id: 'a-123', role: 'assistant' },
      ],
    });
  });

  it('does not send a second prompt once the conversation has started', () => {
    const started = terminalConversationReducer(
      INITIAL_TERMINAL_CONVERSATION_STATE,
      { type: 'send-prompt', sentAt: 123 },
    );

    expect(
      terminalConversationReducer(started, {
        type: 'send-prompt',
        sentAt: 456,
      }),
    ).toBe(started);
  });

  it('resets conversation state to the initial values', () => {
    const started = terminalConversationReducer(
      INITIAL_TERMINAL_CONVERSATION_STATE,
      { type: 'jump-to-end', sentAt: 123 },
    );

    expect(terminalConversationReducer(started, { type: 'reset' })).toBe(
      INITIAL_TERMINAL_CONVERSATION_STATE,
    );
  });

  it('jumps to the completed chat state and closes the diff panel', () => {
    expect(
      terminalConversationReducer(
        {
          ...INITIAL_TERMINAL_CONVERSATION_STATE,
          isDiffOpen: true,
          view: 'editor',
        },
        { type: 'jump-to-end', sentAt: 123 },
      ),
    ).toMatchObject({
      instantComplete: true,
      isChatFinished: true,
      isDiffOpen: false,
      messages: [
        { id: 'u-123', role: 'user' },
        { id: 'a-123', role: 'assistant' },
      ],
      view: 'ai-chat',
    });
  });
});
