import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { hasAgentChatReplyContent } from 'src/engine/metadata-modules/ai/ai-chat/utils/has-agent-chat-reply-content.util';

const part = (value: Record<string, unknown>) =>
  value as unknown as ExtendedUIMessagePart;

describe('hasAgentChatReplyContent', () => {
  it('finds nothing in a reply without parts', () => {
    expect(hasAgentChatReplyContent([])).toBe(false);
  });

  it('finds nothing in a reply that only started a step and titled the thread', () => {
    expect(
      hasAgentChatReplyContent([
        part({ type: 'step-start' }),
        part({ type: 'text', text: ' \n' }),
        part({ type: 'reasoning', text: '' }),
        part({
          type: 'data-thread-title',
          id: 'thread-title-1',
          data: { title: 'Quarterly plan' },
        }),
      ]),
    ).toBe(false);
  });

  it('finds written text', () => {
    expect(
      hasAgentChatReplyContent([
        part({ type: 'step-start' }),
        part({ type: 'text', text: 'Here is the plan.' }),
      ]),
    ).toBe(true);
  });

  it('finds reasoning', () => {
    expect(
      hasAgentChatReplyContent([
        part({ type: 'reasoning', text: 'Reading the deal first.' }),
      ]),
    ).toBe(true);
  });

  it('finds a tool call without text', () => {
    expect(
      hasAgentChatReplyContent([
        part({ type: 'step-start' }),
        part({
          type: 'tool-ask_question',
          toolCallId: 'ask-1',
          state: 'input-available',
          input: {},
        }),
      ]),
    ).toBe(true);
  });
});
