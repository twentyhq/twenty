import { computeSendChatMessageOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-send-chat-message-output-schema.util';

describe('computeSendChatMessageOutputSchema', () => {
  it('describes the tool call outcome only when the message carries one', () => {
    expect(
      Object.keys(computeSendChatMessageOutputSchema({ hasToolCall: false })),
    ).toEqual(['threadId']);
    expect(
      Object.keys(computeSendChatMessageOutputSchema({ hasToolCall: true })),
    ).toEqual([
      'threadId',
      'outcome',
      'toolName',
      'feedback',
      'error',
      'arguments',
      'output',
    ]);
  });
});
