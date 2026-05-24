import { type UIMessage } from 'ai';

import { sanitizeOpenAiZdrMessageHistory } from 'src/engine/metadata-modules/ai/ai-chat/utils/sanitize-openai-zdr-message-history.util';

describe('sanitizeOpenAiZdrMessageHistory', () => {
  it('replaces persisted tool parts with text so OpenAI ZDR does not receive tool call ids', () => {
    const messages = [
      {
        id: 'message-1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-get_people',
            toolCallId: 'fc_123',
            input: { limit: 1 },
            output: { people: [{ name: 'Ada Lovelace' }] },
            state: 'output-available',
          },
          {
            type: 'text',
            text: 'Found one person.',
          },
        ],
      },
    ] as unknown as UIMessage[];

    const sanitized = sanitizeOpenAiZdrMessageHistory(messages);

    expect(sanitized).toEqual([
      {
        id: 'message-1',
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: [
              'Tool result (get_people):',
              JSON.stringify({ people: [{ name: 'Ada Lovelace' }] }, null, 2),
            ].join('\n'),
          },
          {
            type: 'text',
            text: 'Found one person.',
          },
        ],
      },
    ]);
    expect(JSON.stringify(sanitized)).not.toContain('fc_123');
    expect(JSON.stringify(sanitized)).not.toContain('toolCallId');
  });

  it('keeps user and non-tool assistant parts unchanged', () => {
    const messages = [
      {
        id: 'message-1',
        role: 'user',
        parts: [{ type: 'text', text: 'Summarize this file' }],
      },
      {
        id: 'message-2',
        role: 'assistant',
        parts: [
          {
            type: 'source-url',
            sourceId: 'source-1',
            url: 'https://example.com',
            title: 'Example',
          },
        ],
      },
    ] as unknown as UIMessage[];

    expect(sanitizeOpenAiZdrMessageHistory(messages)).toEqual(messages);
  });

  it('drops messages that only contain tool calls without output or errors', () => {
    const messages = [
      {
        id: 'message-1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-get_people',
            toolCallId: 'fc_123',
            input: { limit: 1 },
            state: 'input-available',
          },
        ],
      },
    ] as unknown as UIMessage[];

    expect(sanitizeOpenAiZdrMessageHistory(messages)).toEqual([]);
  });
});
