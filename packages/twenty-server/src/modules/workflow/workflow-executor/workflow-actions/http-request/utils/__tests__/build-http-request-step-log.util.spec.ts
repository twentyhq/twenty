import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type WorkflowHttpRequestActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/http-request/types/workflow-http-request-action-input.type';
import { buildHttpRequestStepLog } from 'src/modules/workflow/workflow-executor/workflow-actions/http-request/utils/build-http-request-step-log.util';

const baseInput: WorkflowHttpRequestActionInput = {
  url: 'https://api.example.com/widgets',
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    Authorization: 'Bearer super-secret-token',
  },
  body: { hello: 'world' },
};

const baseOutput: ToolOutput = {
  success: true,
  message: 'OK',
  result: { id: 'abc' },
  status: 201,
  statusText: 'Created',
  headers: {
    'content-type': 'application/json',
    'set-cookie': 'sid=abc; HttpOnly',
  },
};

describe('buildHttpRequestStepLog', () => {
  it('redacts sensitive request and response headers', () => {
    const stepLog = buildHttpRequestStepLog({
      input: baseInput,
      output: baseOutput,
      durationMs: 42,
    });

    if (stepLog.details.type !== 'HTTP_REQUEST') {
      throw new Error('Expected HTTP_REQUEST details');
    }

    expect(stepLog.details.request.headers.Authorization).toBe('[redacted]');
    expect(stepLog.details.request.headers['content-type']).toBe(
      'application/json',
    );

    expect(stepLog.details.response?.headers['set-cookie']).toBe('[redacted]');
    expect(stepLog.details.response?.headers['content-type']).toBe(
      'application/json',
    );
  });

  it('stringifies and reports body byte size', () => {
    const stepLog = buildHttpRequestStepLog({
      input: baseInput,
      output: baseOutput,
      durationMs: 10,
    });

    if (stepLog.details.type !== 'HTTP_REQUEST') {
      throw new Error('Expected HTTP_REQUEST details');
    }

    expect(stepLog.details.request.body).toBe('{"hello":"world"}');
    expect(stepLog.details.request.bodyBytes).toBe(17);
    expect(stepLog.details.request.bodyTruncated).toBe(false);

    expect(stepLog.details.response?.body).toBe('{"id":"abc"}');
    expect(stepLog.details.response?.bodyBytes).toBe(12);
  });

  it('truncates oversized request bodies and marks bodyTruncated', () => {
    const longPayload = 'x'.repeat(100_000);

    const stepLog = buildHttpRequestStepLog({
      input: { ...baseInput, body: { payload: longPayload } },
      output: baseOutput,
      durationMs: 10,
    });

    if (stepLog.details.type !== 'HTTP_REQUEST') {
      throw new Error('Expected HTTP_REQUEST details');
    }

    expect(stepLog.details.request.bodyTruncated).toBe(true);
    expect(stepLog.details.request.body).toContain('truncated');
    expect(stepLog.details.request.bodyBytes).toBeGreaterThan(100_000);
  });

  it('truncates non-ASCII bodies by UTF-8 bytes, not UTF-16 code units', () => {
    // CJK characters take 3 UTF-8 bytes each but 1 UTF-16 code unit.
    // Before the byte-aware fix, `redacted.slice(0, 32_000)` on this payload
    // would emit ~96 KB of UTF-8 (three times the intended cap). After the
    // fix the truncated payload stays within the cap, plus at most one
    // U+FFFD replacement char (~3 bytes) for a multi-byte sequence cut at
    // the boundary.
    const longCjkPayload = '日'.repeat(40_000);

    const stepLog = buildHttpRequestStepLog({
      input: { ...baseInput, body: { payload: longCjkPayload } },
      output: baseOutput,
      durationMs: 10,
    });

    if (stepLog.details.type !== 'HTTP_REQUEST') {
      throw new Error('Expected HTTP_REQUEST details');
    }

    expect(stepLog.details.request.bodyTruncated).toBe(true);

    const truncatedBody = stepLog.details.request.body ?? '';
    const truncatedByteLength = Buffer.byteLength(
      truncatedBody.replace('…[truncated]', ''),
      'utf8',
    );

    expect(truncatedByteLength).toBeLessThanOrEqual(32_000 + 3);
  });

  it('omits response when the request never received one (transport error)', () => {
    const stepLog = buildHttpRequestStepLog({
      input: baseInput,
      output: {
        success: false,
        message: `HTTP POST request to ${baseInput.url} failed`,
        error: 'ENOTFOUND api.example.com',
      },
      durationMs: 30,
    });

    if (stepLog.details.type !== 'HTTP_REQUEST') {
      throw new Error('Expected HTTP_REQUEST details');
    }

    expect(stepLog.details.response).toBeUndefined();
    expect(stepLog.details.error).toBe('ENOTFOUND api.example.com');
  });

  it('captures response details when an HTTP error response is returned', () => {
    const stepLog = buildHttpRequestStepLog({
      input: baseInput,
      output: {
        success: false,
        message: 'failed',
        error: '{"code":"invalid"}',
        status: 422,
        statusText: 'Unprocessable Entity',
        headers: { 'content-type': 'application/json' },
        result: { code: 'invalid' },
      },
      durationMs: 55,
    });

    if (stepLog.details.type !== 'HTTP_REQUEST') {
      throw new Error('Expected HTTP_REQUEST details');
    }

    expect(stepLog.details.response?.status).toBe(422);
    expect(stepLog.details.response?.statusText).toBe('Unprocessable Entity');
    expect(stepLog.details.response?.body).toBe('{"code":"invalid"}');
    expect(stepLog.details.error).toBe('{"code":"invalid"}');
  });

  it('redacts sensitive query-string parameters in the request URL', () => {
    const stepLog = buildHttpRequestStepLog({
      input: {
        ...baseInput,
        url: 'https://api.example.com/data?page=1&api_key=AKIA-leaked&token=oauth-leaked&safe=ok',
      },
      output: baseOutput,
      durationMs: 1,
    });

    if (stepLog.details.type !== 'HTTP_REQUEST') {
      throw new Error('Expected HTTP_REQUEST details');
    }

    const url = new URL(stepLog.details.request.url);

    expect(url.searchParams.get('api_key')).toBe('[redacted]');
    expect(url.searchParams.get('token')).toBe('[redacted]');
    expect(url.searchParams.get('page')).toBe('1');
    expect(url.searchParams.get('safe')).toBe('ok');
  });

  it('leaves the URL untouched when there are no sensitive params', () => {
    const stepLog = buildHttpRequestStepLog({
      input: { ...baseInput, url: 'https://api.example.com/widgets?page=2' },
      output: baseOutput,
      durationMs: 1,
    });

    if (stepLog.details.type !== 'HTTP_REQUEST') {
      throw new Error('Expected HTTP_REQUEST details');
    }

    expect(stepLog.details.request.url).toBe(
      'https://api.example.com/widgets?page=2',
    );
  });

  it('redacts sensitive query params even when the URL is unparseable (regression)', () => {
    // Whitespace in the host trips up the WHATWG URL parser, so this URL
    // is rejected by `new URL()`. Before the fallback was added, the catch
    // branch returned the raw URL with secrets intact.
    const unparseableUrl =
      'https://api example.com/data?page=1&api_key=AKIA-leaked&token=oauth-leaked&safe=ok';

    expect(() => new URL(unparseableUrl)).toThrow();

    const stepLog = buildHttpRequestStepLog({
      input: { ...baseInput, url: unparseableUrl },
      output: baseOutput,
      durationMs: 1,
    });

    if (stepLog.details.type !== 'HTTP_REQUEST') {
      throw new Error('Expected HTTP_REQUEST details');
    }

    const redactedUrl = stepLog.details.request.url;

    expect(redactedUrl).not.toContain('AKIA-leaked');
    expect(redactedUrl).not.toContain('oauth-leaked');
    expect(redactedUrl).toContain('api_key=[redacted]');
    expect(redactedUrl).toContain('token=[redacted]');
    expect(redactedUrl).toContain('page=1');
    expect(redactedUrl).toContain('safe=ok');
  });

  it('redacts percent-encoded sensitive param names in unparseable URLs', () => {
    // `api%5Fkey` decodes to `api_key` — the fallback must decode before
    // matching against the sensitive-name set.
    const unparseableUrl = 'https://api example.com/x?api%5Fkey=leaked';

    expect(() => new URL(unparseableUrl)).toThrow();

    const stepLog = buildHttpRequestStepLog({
      input: { ...baseInput, url: unparseableUrl },
      output: baseOutput,
      durationMs: 1,
    });

    if (stepLog.details.type !== 'HTTP_REQUEST') {
      throw new Error('Expected HTTP_REQUEST details');
    }

    expect(stepLog.details.request.url).not.toContain('leaked');
    expect(stepLog.details.request.url).toContain('api%5Fkey=[redacted]');
  });

  it('redacts sensitive keys in JSON request bodies (deep)', () => {
    const stepLog = buildHttpRequestStepLog({
      input: {
        ...baseInput,
        body: {
          username: 'alice',
          password: 'hunter2',
          credentials: { client_secret: 'oauth-secret', clientId: 'public' },
          tokens: [{ access_token: 'aaa', issuedAt: 1 }],
        } as unknown as WorkflowHttpRequestActionInput['body'],
      },
      output: baseOutput,
      durationMs: 1,
    });

    if (stepLog.details.type !== 'HTTP_REQUEST') {
      throw new Error('Expected HTTP_REQUEST details');
    }

    const parsed = JSON.parse(stepLog.details.request.body ?? '{}');

    expect(parsed.username).toBe('alice');
    expect(parsed.password).toBe('[redacted]');
    expect(parsed.credentials.client_secret).toBe('[redacted]');
    expect(parsed.credentials.clientId).toBe('public');
    expect(parsed.tokens[0].access_token).toBe('[redacted]');
    expect(parsed.tokens[0].issuedAt).toBe(1);
  });

  it('redacts sensitive keys in JSON response bodies (OAuth token endpoint shape)', () => {
    const stepLog = buildHttpRequestStepLog({
      input: baseInput,
      output: {
        ...baseOutput,
        result: {
          token_type: 'Bearer',
          access_token: 'leaked-access',
          refresh_token: 'leaked-refresh',
          expires_in: 3600,
        },
      },
      durationMs: 1,
    });

    if (stepLog.details.type !== 'HTTP_REQUEST') {
      throw new Error('Expected HTTP_REQUEST details');
    }

    const parsed = JSON.parse(stepLog.details.response?.body ?? '{}');

    expect(parsed.access_token).toBe('[redacted]');
    expect(parsed.refresh_token).toBe('[redacted]');
    expect(parsed.token_type).toBe('Bearer');
    expect(parsed.expires_in).toBe(3600);
  });

  it('redacts sensitive keys when a request body arrives as a JSON string', () => {
    const stepLog = buildHttpRequestStepLog({
      input: {
        ...baseInput,
        body: '{"username":"alice","password":"hunter2"}',
      },
      output: baseOutput,
      durationMs: 1,
    });

    if (stepLog.details.type !== 'HTTP_REQUEST') {
      throw new Error('Expected HTTP_REQUEST details');
    }

    const parsed = JSON.parse(stepLog.details.request.body ?? '{}');

    expect(parsed.password).toBe('[redacted]');
    expect(parsed.username).toBe('alice');
  });

  it('leaves non-JSON string bodies untouched (e.g. form-encoded)', () => {
    const stepLog = buildHttpRequestStepLog({
      input: { ...baseInput, body: 'name=alice&topic=hello' },
      output: baseOutput,
      durationMs: 1,
    });

    if (stepLog.details.type !== 'HTTP_REQUEST') {
      throw new Error('Expected HTTP_REQUEST details');
    }

    expect(stepLog.details.request.body).toBe('name=alice&topic=hello');
  });

  it('redacts sensitive keys when output.error is a structured object', () => {
    const stepLog = buildHttpRequestStepLog({
      input: baseInput,
      output: {
        success: false,
        message: 'failed',
        error: {
          code: 'invalid_client',
          client_secret: 'leaked',
        } as unknown as string,
        status: 401,
      },
      durationMs: 1,
    });

    if (stepLog.details.type !== 'HTTP_REQUEST') {
      throw new Error('Expected HTTP_REQUEST details');
    }

    const parsed = JSON.parse(stepLog.details.error ?? '{}');

    expect(parsed.client_secret).toBe('[redacted]');
    expect(parsed.code).toBe('invalid_client');
  });
});
