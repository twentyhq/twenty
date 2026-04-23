/**
 * End-to-end test for the partner-application route handler.
 *
 * The handler holds module-level rate-limit state, so each test uses a
 * unique IP to avoid bleeding limits across test cases. Tests that want to
 * exercise rate-limit behaviour explicitly do so with a single, dedicated
 * IP.
 */

const ORIGINAL_FETCH = global.fetch;
const ORIGINAL_WEBHOOK_URL = process.env.PARTNER_APPLICATION_WEBHOOK_URL;

const VALID_BODY = JSON.stringify({ email: 'a@b.co', name: 'Ada Lovelace' });

function buildRequest({
  body = VALID_BODY,
  contentType = 'application/json',
  ip = '203.0.113.1',
  contentLength,
}: {
  body?: string;
  contentType?: string | null;
  ip?: string;
  contentLength?: string;
} = {}) {
  const headers = new Headers();
  if (contentType !== null) headers.set('content-type', contentType);
  headers.set('x-forwarded-for', ip);
  if (contentLength !== undefined) headers.set('content-length', contentLength);

  return new Request('https://example.com/api/partner-application', {
    method: 'POST',
    headers,
    body,
  });
}

async function loadRoute() {
  // Re-import per test so module-level rate-limit state starts fresh in
  // tests that need it. Tests that don't call this share a single warm
  // module (matching the production serverless model).
  jest.resetModules();
  const mod = await import('@/app/api/partner-application/route');
  return mod;
}

describe('POST /api/partner-application', () => {
  beforeEach(() => {
    process.env.PARTNER_APPLICATION_WEBHOOK_URL = 'https://hooks.example/test';
  });

  afterEach(() => {
    global.fetch = ORIGINAL_FETCH;
    process.env.PARTNER_APPLICATION_WEBHOOK_URL = ORIGINAL_WEBHOOK_URL;
  });

  it('returns 503 when the webhook URL is not configured', async () => {
    delete process.env.PARTNER_APPLICATION_WEBHOOK_URL;
    const { POST } = await loadRoute();

    const response = await POST(buildRequest());
    expect(response.status).toBe(503);
  });

  it('returns 503 when the webhook URL is not a valid URL', async () => {
    process.env.PARTNER_APPLICATION_WEBHOOK_URL = 'not-a-url';
    const { POST } = await loadRoute();

    const response = await POST(buildRequest());
    expect(response.status).toBe(503);
  });

  it('returns 415 when content-type is not JSON', async () => {
    const { POST } = await loadRoute();
    const response = await POST(
      buildRequest({
        contentType: 'application/x-www-form-urlencoded',
        ip: '203.0.113.10',
      }),
    );
    expect(response.status).toBe(415);
  });

  it('returns 413 when content-length declares a too-large body', async () => {
    const { POST } = await loadRoute();
    const response = await POST(
      buildRequest({
        contentLength: '99999999',
        ip: '203.0.113.11',
      }),
    );
    expect(response.status).toBe(413);
  });

  it('returns 400 on malformed JSON', async () => {
    const { POST } = await loadRoute();
    const response = await POST(
      buildRequest({ body: '{not-json', ip: '203.0.113.12' }),
    );
    expect(response.status).toBe(400);
  });

  it('returns 400 when required fields are missing', async () => {
    const { POST } = await loadRoute();
    const response = await POST(
      buildRequest({
        body: JSON.stringify({ email: 'a@b.co' }),
        ip: '203.0.113.13',
      }),
    );
    expect(response.status).toBe(400);
  });

  it('returns 400 when email is invalid', async () => {
    const { POST } = await loadRoute();
    const response = await POST(
      buildRequest({
        body: JSON.stringify({ email: 'not-an-email', name: 'Ada' }),
        ip: '203.0.113.14',
      }),
    );
    expect(response.status).toBe(400);
  });

  it('returns 400 when extra fields are present (strict schema)', async () => {
    const { POST } = await loadRoute();
    const response = await POST(
      buildRequest({
        body: JSON.stringify({
          email: 'a@b.co',
          name: 'Ada',
          extra: 'nope',
        }),
        ip: '203.0.113.15',
      }),
    );
    expect(response.status).toBe(400);
  });

  it('forwards a valid submission to the webhook with split name and returns 200', async () => {
    const fetchSpy = jest
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));
    global.fetch = fetchSpy;

    const { POST } = await loadRoute();
    const response = await POST(buildRequest({ ip: '203.0.113.20' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://hooks.example/test');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({
      Email: 'a@b.co',
      FirstName: 'Ada',
      LastName: 'Lovelace',
    });
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('returns 502 when the webhook responds with a non-2xx status', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response('boom', { status: 500 }));

    const { POST } = await loadRoute();
    const response = await POST(buildRequest({ ip: '203.0.113.21' }));
    expect(response.status).toBe(502);
  });

  it('returns 502 when the webhook fetch throws (network error)', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('connection refused'));

    const { POST } = await loadRoute();
    const response = await POST(buildRequest({ ip: '203.0.113.22' }));
    expect(response.status).toBe(502);
  });

  it('returns 504 when the webhook surfaces an AbortError (timeout path)', async () => {
    // The route's WEBHOOK_TIMEOUT_MS is intentionally hardcoded inside the
    // module; rather than wait it out, we simulate the same observable
    // outcome — fetchWithTimeout returns `{ ok: false, error: 'timeout' }`
    // — by rejecting with an AbortError immediately. Mapping `timeout → 504`
    // is the only thing the route owns; the actual timing is covered by
    // `fetch-with-timeout.test.ts`.
    global.fetch = jest
      .fn()
      .mockRejectedValue(
        Object.assign(new Error('aborted'), { name: 'AbortError' }),
      );

    const { POST } = await loadRoute();
    const response = await POST(buildRequest({ ip: '203.0.113.23' }));
    expect(response.status).toBe(504);
  });

  it('rate-limits the same IP after the burst capacity is spent', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));

    const { POST } = await loadRoute();
    const ip = '203.0.113.99';
    const statuses: number[] = [];

    // Capacity is 5. Six rapid-fire requests → fifth allowed, sixth denied.
    for (let i = 0; i < 6; i++) {
      const r = await POST(buildRequest({ ip }));
      statuses.push(r.status);
    }

    expect(statuses.slice(0, 5).every((s) => s === 200)).toBe(true);
    expect(statuses[5]).toBe(429);
  });

  it('attaches a Retry-After header on 429 responses', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));

    const { POST } = await loadRoute();
    const ip = '203.0.113.100';
    for (let i = 0; i < 5; i++) {
      await POST(buildRequest({ ip }));
    }

    const denied = await POST(buildRequest({ ip }));
    expect(denied.status).toBe(429);
    const retryAfter = denied.headers.get('Retry-After');
    expect(retryAfter).not.toBeNull();
    expect(Number.parseInt(retryAfter ?? '0', 10)).toBeGreaterThan(0);
  });
});
