import { type UIMessage } from 'ai';

import { sanitizeAzureMessagesForReplay } from 'src/engine/metadata-modules/ai/ai-chat/utils/sanitize-azure-messages-for-replay.util';
import { AI_SDK_AZURE } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';

const createAssistantMessage = (parts: unknown[]): UIMessage => ({
  id: 'message-id',
  role: 'assistant',
  parts: parts as UIMessage['parts'],
});

const createReasoningPart = (providerMetadata?: unknown) => ({
  type: 'reasoning',
  text: 'summary',
  state: 'done',
  ...(providerMetadata === undefined ? {} : { providerMetadata }),
});

const toolPart = {
  type: 'tool-execute_tool',
  toolCallId: 'call-id',
  state: 'output-available',
  input: {},
  output: { success: true },
};

describe('sanitizeAzureMessagesForReplay', () => {
  it('removes a tool call whose preceding reasoning has no encrypted content', () => {
    const messages = [
      createAssistantMessage([createReasoningPart(), toolPart]),
    ];

    const [message] = sanitizeAzureMessagesForReplay(messages, AI_SDK_AZURE);

    expect(message.parts).toEqual([createReasoningPart()]);
  });

  it('keeps a tool call when its preceding reasoning has encrypted content', () => {
    const messages = [
      createAssistantMessage([
        createReasoningPart({
          openai: { reasoningEncryptedContent: 'encrypted-content' },
        }),
        toolPart,
      ]),
    ];

    const [message] = sanitizeAzureMessagesForReplay(messages, AI_SDK_AZURE);

    expect(message.parts).toEqual([
      createReasoningPart({
        openai: { reasoningEncryptedContent: 'encrypted-content' },
      }),
      toolPart,
    ]);
  });

  it('does not change messages for other providers', () => {
    const messages = [createAssistantMessage([createReasoningPart(), toolPart])];

    expect(sanitizeAzureMessagesForReplay(messages, '@ai-sdk/openai')).toBe(
      messages,
    );
  });
});
