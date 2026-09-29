import { InvalidPromptError, RetryError, StreamProviderError } from 'ai';

import { getAiChatStreamFailureFingerprint } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-ai-chat-stream-failure-fingerprint.util';

describe('getAiChatStreamFailureFingerprint', () => {
  it('should group exhausted retries with the error that was retried', () => {
    const overloaded = new StreamProviderError({
      message: 'Overloaded',
      statusCode: 503,
    });

    expect(
      getAiChatStreamFailureFingerprint({
        error: new RetryError({
          message: 'Failed after 3 attempts. Last error: Overloaded',
          reason: 'maxRetriesExceeded',
          errors: [overloaded, overloaded],
        }),
        modelId: 'anthropic/claude-opus-5',
      }),
    ).toEqual([
      'ai-chat-stream-failure',
      'anthropic',
      'AI_StreamProviderError',
      '503',
    ]);
  });

  it('should keep AI SDK errors without an HTTP status apart from provider errors', () => {
    expect(
      getAiChatStreamFailureFingerprint({
        error: new InvalidPromptError({
          prompt: [],
          message: 'The messages do not match the ModelMessage[] schema.',
        }),
        modelId: 'azure-foundry/gpt-5.6-luna',
      }),
    ).toEqual([
      'ai-chat-stream-failure',
      'azure-foundry',
      'AI_InvalidPromptError',
      'no-status',
    ]);
  });

  it('should leave errors raised by our own code to stack trace grouping', () => {
    expect(
      getAiChatStreamFailureFingerprint({
        error: new TypeError('Cannot read properties of undefined'),
        modelId: 'openai/gpt-5.6-luna',
      }),
    ).toBeUndefined();
  });
});
