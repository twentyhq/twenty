import {
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';

import { sanitizeMessagePartsForModel } from 'src/engine/metadata-modules/ai/ai-chat/utils/sanitize-message-parts-for-model.util';

const DIRECTLY_CALLABLE = new Set(['execute_tool', 'learn_tools']);

const buildReasoningPart = (
  overrides: Record<string, unknown> = {},
): ExtendedUIMessagePart =>
  ({
    type: 'reasoning',
    text: 'Internal thinking process',
    ...overrides,
  }) as ExtendedUIMessagePart;

const buildTextPart = (text: string): ExtendedUIMessagePart => ({
  type: 'text',
  text,
});

const buildToolPart = (
  overrides: Record<string, unknown> = {},
): ExtendedUIMessagePart =>
  ({
    type: 'tool-custom_tool',
    toolCallId: 'call_1',
    input: { query: 'test' },
    state: 'output-error',
    errorText: "Model tried to call unavailable tool 'custom_tool'.",
    ...overrides,
  }) as ExtendedUIMessagePart;

describe('sanitizeMessagePartsForModel', () => {
  it('omits reasoning parts from assistant messages while preserving other parts', () => {
    const messages: ExtendedUIMessage[] = [
      {
        id: 'msg_1',
        role: 'assistant',
        parts: [
          buildReasoningPart(),
          buildTextPart('Hello, how can I assist you?'),
        ],
      },
    ];

    const result = sanitizeMessagePartsForModel(messages, DIRECTLY_CALLABLE);

    expect(result).toHaveLength(1);
    expect(result[0].parts).toEqual([
      buildTextPart('Hello, how can I assist you?'),
    ]);
  });

  it('backfills an empty text part when an assistant message only has reasoning parts', () => {
    const messages: ExtendedUIMessage[] = [
      {
        id: 'msg_1',
        role: 'assistant',
        parts: [buildReasoningPart()],
      },
    ];

    const result = sanitizeMessagePartsForModel(messages, DIRECTLY_CALLABLE);

    expect(result).toHaveLength(1);
    expect(result[0].parts).toEqual([buildTextPart('')]);
  });

  it('preserves text and tool parts on assistant messages and cleans uncallable tools', () => {
    const messages: ExtendedUIMessage[] = [
      {
        id: 'msg_1',
        role: 'assistant',
        parts: [
          buildReasoningPart(),
          buildToolPart(),
          buildTextPart('Done processing.'),
        ],
      },
    ];

    const result = sanitizeMessagePartsForModel(messages, DIRECTLY_CALLABLE);

    expect(result[0].parts).toHaveLength(2);
    expect(result[0].parts[0]).toMatchObject({
      type: 'tool-custom_tool',
      toolCallId: 'call_1',
      state: 'output-error',
    });
    expect((result[0].parts[0] as { errorText: string }).errorText).toContain(
      'learn_tools({ toolNames: ["custom_tool"] })',
    );
    expect(result[0].parts[1]).toEqual(buildTextPart('Done processing.'));
  });

  it('preserves user messages unchanged without reasoning stripping', () => {
    const messages: ExtendedUIMessage[] = [
      {
        id: 'msg_1',
        role: 'user',
        parts: [buildTextPart('Can you summarize my deals?')],
      },
    ];

    const result = sanitizeMessagePartsForModel(messages, DIRECTLY_CALLABLE);

    expect(result).toEqual(messages);
  });
});
