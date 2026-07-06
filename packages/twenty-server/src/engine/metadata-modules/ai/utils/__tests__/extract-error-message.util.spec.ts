import { extractErrorMessage } from 'src/engine/metadata-modules/ai/utils/extract-error-message.util';

describe('extractErrorMessage', () => {
  it('returns the message of an Error instance', () => {
    expect(extractErrorMessage(new Error('Provider timed out'))).toBe(
      'Provider timed out',
    );
  });

  it('falls back to the Error name when its message is empty', () => {
    expect(extractErrorMessage(new TypeError(''))).toBe('TypeError');
  });

  it('returns string errors as-is', () => {
    expect(extractErrorMessage('boom')).toBe('boom');
  });

  it('extracts the message from a flat provider error object', () => {
    expect(
      extractErrorMessage({
        message:
          'Incorrect API key provided: sk-proj-***. You can find your API key at https://platform.openai.com/account/api-keys.',
        type: 'invalid_request_error',
        param: null,
        code: 'invalid_api_key',
      }),
    ).toBe(
      'Incorrect API key provided: sk-proj-***. You can find your API key at https://platform.openai.com/account/api-keys. (invalid_api_key)',
    );
  });

  it('extracts the message from a provider payload nested under an error key', () => {
    expect(
      extractErrorMessage({
        error: {
          message: 'Incorrect API key provided',
          code: 'invalid_api_key',
        },
      }),
    ).toBe('Incorrect API key provided (invalid_api_key)');
  });

  it('appends a numeric statusCode when present', () => {
    expect(
      extractErrorMessage({
        message: 'Rate limit exceeded',
        statusCode: 429,
      }),
    ).toBe('Rate limit exceeded (429)');
  });

  it('never produces "[object Object]" for plain objects', () => {
    expect(extractErrorMessage({ status: 'failed' })).toBe(
      '{"status":"failed"}',
    );
  });

  it('truncates oversized serialized objects', () => {
    const result = extractErrorMessage({ detail: 'x'.repeat(10_000) });

    expect(result.length).toBe(2001);
    expect(result.endsWith('…')).toBe(true);
  });

  it('stringifies primitives', () => {
    expect(extractErrorMessage(429)).toBe('429');
    expect(extractErrorMessage(false)).toBe('false');
  });

  it('uses the fallback for null, undefined, and unserializable values', () => {
    expect(extractErrorMessage(null)).toBe('Unknown error');
    expect(extractErrorMessage(undefined)).toBe('Unknown error');
    expect(extractErrorMessage({}, 'Stream execution failed')).toBe(
      'Stream execution failed',
    );

    const circular: Record<string, unknown> = {};

    circular.self = circular;
    expect(extractErrorMessage(circular, 'Stream execution failed')).toBe(
      'Stream execution failed',
    );
  });
});
