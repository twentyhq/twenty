import { type ModelMessage } from 'ai';

import { MessagePruningService } from 'src/engine/metadata-modules/ai/ai-chat/services/message-pruning.service';

const CONTEXT_WINDOW_TOKENS = 1_000_000;
const HARD_OVERFLOW_TOKENS = CONTEXT_WINDOW_TOKENS * 0.9;

const buildToolHeavyConversation = (): ModelMessage[] => [
  { role: 'user', content: 'find my companies' },
  {
    role: 'assistant',
    content: [
      {
        type: 'tool-call',
        toolCallId: 'call-1',
        toolName: 'find_many_companies',
        input: {},
      },
    ],
  },
  {
    role: 'tool',
    content: [
      {
        type: 'tool-result',
        toolCallId: 'call-1',
        toolName: 'find_many_companies',
        output: { type: 'text', value: 'big tool output' },
      },
    ],
  },
  { role: 'assistant', content: 'Here are your companies.' },
  { role: 'user', content: 'thanks' },
  { role: 'assistant', content: 'You are welcome.' },
];

describe('MessagePruningService', () => {
  const service = new MessagePruningService();

  it('should not prune below 90% of the context window', () => {
    const messages = buildToolHeavyConversation();

    const result = service.pruneIfOverContextWindowLimit(
      messages,
      CONTEXT_WINDOW_TOKENS,
      HARD_OVERFLOW_TOKENS - 1,
    );

    expect(result.wasPruned).toBe(false);
    expect(result.isStillOverLimit).toBe(false);
    expect(result.messages).toEqual(messages);
  });

  it('should prune old tool calls at 90% of the context window', () => {
    const messages = buildToolHeavyConversation();

    const result = service.pruneIfOverContextWindowLimit(
      messages,
      CONTEXT_WINDOW_TOKENS,
      HARD_OVERFLOW_TOKENS,
    );

    expect(result.wasPruned).toBe(true);
    expect(result.isStillOverLimit).toBe(false);
    expect(result.messages.length).toBeLessThan(messages.length);
  });

  it('should report still-over-limit when nothing can be pruned', () => {
    const messages: ModelMessage[] = [
      { role: 'user', content: 'a very long question' },
      { role: 'assistant', content: 'a very long answer' },
    ];

    const result = service.pruneIfOverContextWindowLimit(
      messages,
      CONTEXT_WINDOW_TOKENS,
      HARD_OVERFLOW_TOKENS,
    );

    expect(result.wasPruned).toBe(false);
    expect(result.isStillOverLimit).toBe(true);
  });
});
