import { APICallError, InvalidPromptError, RetryError } from 'ai';

import { getAiChatStreamFailureFingerprint } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-ai-chat-stream-failure-fingerprint.util';

const buildApiCallError = (statusCode?: number) =>
  new APICallError({
    message: 'Provider refused the request',
    url: 'https://api.anthropic.com/v1/messages',
    requestBodyValues: {},
    statusCode,
  });

describe('getAiChatStreamFailureFingerprint', () => {
  it('should group provider errors by provider, error class and HTTP status', () => {
    expect(
      getAiChatStreamFailureFingerprint({
        error: buildApiCallError(429),
        modelId: 'azure-foundry/gpt-5.6-luna@medium',
      }),
    ).toEqual([
      'ai-chat-stream-failure',
      'azure-foundry',
      'AI_APICallError',
      '429',
    ]);
  });

  it('should group exhausted retries with the error that was retried', () => {
    const lastError = buildApiCallError(529);

    expect(
      getAiChatStreamFailureFingerprint({
        error: new RetryError({
          message: 'Failed after 3 attempts. Last error: Overloaded',
          reason: 'maxRetriesExceeded',
          errors: [buildApiCallError(529), lastError],
        }),
        modelId: 'anthropic/claude-opus-5',
      }),
    ).toEqual([
      'ai-chat-stream-failure',
      'anthropic',
      'AI_APICallError',
      '529',
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

  it('should group values that are not errors by their type', () => {
    expect(
      getAiChatStreamFailureFingerprint({
        error: 'upstream connect error',
        modelId: 'openai/gpt-5.6-luna',
      }),
    ).toEqual(['ai-chat-stream-failure', 'openai', 'string', 'no-status']);
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
