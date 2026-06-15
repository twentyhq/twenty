// Force module scope: this file uses dynamic import() and global jest, so it
// has no top-level import/export. Without this, tsc treats it as a global
// script and its top-level bindings collide with the sibling route tests.
export {};

const ORIGINAL_FETCH = global.fetch;
const ORIGINAL_BASE = process.env.BRIEF_REVIEW_BASE_URL;
const ORIGINAL_SECRET = process.env.PARTNER_APPLICATION_SECRET;

const VALID_BODY = JSON.stringify({
  token: 'tok-123',
  applicationId: 'app-456',
});

function buildRequest({
  body = VALID_BODY,
  contentType = 'application/json',
  ip = '203.0.113.1',
}: { body?: string; contentType?: string | null; ip?: string } = {}) {
  const headers = new Headers();
  if (contentType !== null) headers.set('content-type', contentType);
  headers.set('x-forwarded-for', ip);
  return new Request('https://example.com/api/brief-pick', {
    method: 'POST',
    headers,
    body,
  });
}

async function loadRoute() {
  jest.resetModules();
  return import('@/app/api/brief-pick/route');
}

describe('POST /api/brief-pick', () => {
  beforeEach(() => {
    process.env.BRIEF_REVIEW_BASE_URL =
      'https://hooks.example/c/app/brief-review';
    process.env.PARTNER_APPLICATION_SECRET = 'test-key-abc123';
  });
  afterEach(() => {
    global.fetch = ORIGINAL_FETCH;
    process.env.BRIEF_REVIEW_BASE_URL = ORIGINAL_BASE;
    process.env.PARTNER_APPLICATION_SECRET = ORIGINAL_SECRET;
  });

  it('returns 503 when the base URL is not configured', async () => {
    delete process.env.BRIEF_REVIEW_BASE_URL;
    const { POST } = await loadRoute();
    expect((await POST(buildRequest())).status).toBe(503);
  });

  it('returns 503 when the secret is not configured', async () => {
    delete process.env.PARTNER_APPLICATION_SECRET;
    const { POST } = await loadRoute();
    expect((await POST(buildRequest({ ip: '203.0.113.2' }))).status).toBe(503);
  });

  it('returns 400 when token/applicationId are missing', async () => {
    const { POST } = await loadRoute();
    const res = await POST(
      buildRequest({ body: JSON.stringify({ token: 'x' }), ip: '203.0.113.3' }),
    );
    expect(res.status).toBe(400);
  });

  it('forwards the pick to <base>/pick with the secret header and returns 200', async () => {
    const fetchSpy = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, picked: 'app-456' }), {
        status: 200,
      }),
    );
    global.fetch = fetchSpy;
    const { POST } = await loadRoute();
    const res = await POST(buildRequest({ ip: '203.0.113.4' }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ success: true });
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://hooks.example/c/app/brief-review/pick');
    expect(init.method).toBe('POST');
    expect(init.headers['X-Application-Secret']).toBe('test-key-abc123');
    expect(JSON.parse(init.body as string)).toEqual({
      token: 'tok-123',
      applicationId: 'app-456',
    });
  });

  it('returns 502 when the upstream responds non-2xx', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response('boom', { status: 500 }));
    const { POST } = await loadRoute();
    expect((await POST(buildRequest({ ip: '203.0.113.5' }))).status).toBe(502);
  });

  it('returns 502 when the logic function returns ok:false', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: false, reason: 'FORBIDDEN' }), {
        status: 200,
      }),
    );
    const { POST } = await loadRoute();
    expect((await POST(buildRequest({ ip: '203.0.113.6' }))).status).toBe(502);
  });

  it('rate-limits the same IP after the burst capacity is spent', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );
    const { POST } = await loadRoute();
    const ip = '203.0.113.99';
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++)
      statuses.push((await POST(buildRequest({ ip }))).status);
    expect(statuses[10]).toBe(429);
  });
});
