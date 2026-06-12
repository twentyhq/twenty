import { readJsonBody } from '@/lib/api/read-json-body';

function jsonRequest(
  body: string,
  init: { contentType?: string | null; contentLength?: string | null } = {},
): Request {
  const headers = new Headers();
  if (init.contentType !== null) {
    headers.set('content-type', init.contentType ?? 'application/json');
  }
  if (init.contentLength !== undefined && init.contentLength !== null) {
    headers.set('content-length', init.contentLength);
  }
  return new Request('https://example.com/', {
    method: 'POST',
    headers,
    body,
  });
}

describe('readJsonBody', () => {
  it('parses a valid JSON body within the size cap', async () => {
    const result = await readJsonBody<{ name: string }>(
      jsonRequest(JSON.stringify({ name: 'Ada' })),
      { maxBytes: 1024 },
    );
    expect(result).toEqual({ ok: true, value: { name: 'Ada' } });
  });

  it('rejects a non-JSON content-type', async () => {
    const result = await readJsonBody(
      jsonRequest('name=Ada', {
        contentType: 'application/x-www-form-urlencoded',
      }),
      { maxBytes: 1024 },
    );
    expect(result).toEqual({ ok: false, error: 'wrong-content-type' });
  });

  it('rejects a missing content-type', async () => {
    const result = await readJsonBody(
      jsonRequest('{}', { contentType: null }),
      { maxBytes: 1024 },
    );
    expect(result).toEqual({ ok: false, error: 'wrong-content-type' });
  });

  it('accepts content-types with parameters', async () => {
    const result = await readJsonBody(
      jsonRequest('{}', { contentType: 'application/json; charset=utf-8' }),
      { maxBytes: 1024 },
    );
    expect(result).toEqual({ ok: true, value: {} });
  });

  it('accepts +json content-types (e.g. application/vnd.api+json)', async () => {
    const result = await readJsonBody(
      jsonRequest('{"a":1}', { contentType: 'application/vnd.api+json' }),
      { maxBytes: 1024 },
    );
    expect(result).toEqual({ ok: true, value: { a: 1 } });
  });

  it('rejects when declared content-length exceeds maxBytes (fast-path, body never read)', async () => {
    const result = await readJsonBody(
      jsonRequest('{}', { contentLength: '999999' }),
      { maxBytes: 100 },
    );
    expect(result).toEqual({ ok: false, error: 'too-large' });
  });

  it('rejects when actual body length exceeds maxBytes (no Content-Length header)', async () => {
    const big = JSON.stringify({ pad: 'x'.repeat(2048) });
    const result = await readJsonBody(
      jsonRequest(big, { contentLength: null }),
      { maxBytes: 100 },
    );
    expect(result).toEqual({ ok: false, error: 'too-large' });
  });

  it('rejects malformed JSON', async () => {
    const result = await readJsonBody(jsonRequest('{not-json'), {
      maxBytes: 1024,
    });
    expect(result).toEqual({ ok: false, error: 'invalid-json' });
  });

  it('parses a body that is exactly maxBytes bytes', async () => {
    const body = JSON.stringify({ a: 1 });
    const result = await readJsonBody(jsonRequest(body), {
      maxBytes: body.length,
    });
    expect(result).toEqual({ ok: true, value: { a: 1 } });
  });
});
