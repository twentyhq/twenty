import { APICallError, RetryError } from 'ai';

import { isTransientStreamError } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-transient-stream-error.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

const buildApiCallError = (statusCode: number) =>
  new APICallError({
    message: `HTTP ${statusCode}`,
    url: 'https://provider.example/v1/messages',
    requestBodyValues: {},
    statusCode,
  });

describe('isTransientStreamError', () => {
  it('treats retryable provider API errors as transient', () => {
    expect(isTransientStreamError(buildApiCallError(429))).toBe(true);
    expect(isTransientStreamError(buildApiCallError(503))).toBe(true);
  });

  it('treats non-retryable provider API errors as permanent', () => {
    expect(isTransientStreamError(buildApiCallError(401))).toBe(false);
    expect(isTransientStreamError(buildApiCallError(400))).toBe(false);
  });

  it('treats SDK retry exhaustion on retryable errors as transient', () => {
    const retryError = new RetryError({
      message: 'Failed after 3 attempts',
      reason: 'maxRetriesExceeded',
      errors: [buildApiCallError(529)],
    });

    expect(isTransientStreamError(retryError)).toBe(true);
  });

  it('treats SDK retry abort on non-retryable errors as permanent', () => {
    const retryError = new RetryError({
      message: 'Failed after 1 attempt',
      reason: 'errorNotRetryable',
      errors: [buildApiCallError(401)],
    });

    expect(isTransientStreamError(retryError)).toBe(false);
  });

  it('treats network-level failures as transient', () => {
    expect(isTransientStreamError(new Error('fetch failed'))).toBe(true);
    expect(isTransientStreamError(new Error('read ECONNRESET'))).toBe(true);

    const wrapped = new Error('request failed');

    (wrapped as Error & { cause?: unknown }).cause = new Error(
      'socket hang up',
    );
    expect(isTransientStreamError(wrapped)).toBe(true);
  });

  it('treats domain exceptions and unknown errors as permanent', () => {
    expect(
      isTransientStreamError(
        new AiException('no key', AiExceptionCode.API_KEY_NOT_CONFIGURED),
      ),
    ).toBe(false);
    expect(isTransientStreamError(new Error('conversation too long'))).toBe(
      false,
    );
    expect(isTransientStreamError('boom')).toBe(false);
  });
});
