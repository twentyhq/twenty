const ORIGINAL_FETCH = global.fetch;
const ORIGINAL_WEBHOOK_URL = process.env.PARTNER_APPLICATION_WEBHOOK_URL;
const ORIGINAL_API_KEY = process.env.PARTNER_APPLICATION_SECRET;

const VALID_PAYLOAD = {
  email: 'a@b.co',
  name: 'Ada Lovelace',
  company: 'Analytical Engines',
  website: 'https://analytical.example/',
};

const VALID_BODY = JSON.stringify(VALID_PAYLOAD);

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

// resetModules so each test gets a fresh module-level rate limiter; distinct
// IPs keep buckets from bleeding between cases.
async function loadRoute() {
  jest.resetModules();
  return import('@/app/api/partner-application/route');
}

// Sequential by recursion (not a for-await loop): the rate limiter is stateful,
// so the calls must run in order to deplete the bucket deterministically.
async function runSequentially(
  makeCall: () => Promise<Response>,
  count: number,
): Promise<number[]> {
  if (count === 0) return [];
  const response = await makeCall();
  const rest = await runSequentially(makeCall, count - 1);
  return [response.status, ...rest];
}

describe('POST /api/partner-application', () => {
  beforeEach(() => {
    process.env.PARTNER_APPLICATION_WEBHOOK_URL = 'https://hooks.example/test';
    process.env.PARTNER_APPLICATION_SECRET = 'test-key-abc123';
    // The route logs to console.error on its upstream/logic failure paths,
    // which several tests below exercise on purpose — mute the noise so the
    // suite output stays clean.
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    global.fetch = ORIGINAL_FETCH;
    process.env.PARTNER_APPLICATION_WEBHOOK_URL = ORIGINAL_WEBHOOK_URL;
    process.env.PARTNER_APPLICATION_SECRET = ORIGINAL_API_KEY;
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
      buildRequest({ contentLength: '99999999', ip: '203.0.113.11' }),
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
        body: JSON.stringify({ ...VALID_PAYLOAD, email: 'not-an-email' }),
        ip: '203.0.113.14',
      }),
    );
    expect(response.status).toBe(400);
  });

  it('returns 400 when an extra (legacy) field is present (strictObject)', async () => {
    const { POST } = await loadRoute();
    const response = await POST(
      buildRequest({
        body: JSON.stringify({
          ...VALID_PAYLOAD,
          countryOther: 'Republic of Examples',
        }),
        ip: '203.0.113.15',
      }),
    );
    expect(response.status).toBe(400);
  });

  it('returns 400 when country enum is unknown', async () => {
    const { POST } = await loadRoute();
    const response = await POST(
      buildRequest({
        body: JSON.stringify({ ...VALID_PAYLOAD, country: 'ATLANTIS' }),
        ip: '203.0.113.16',
      }),
    );
    expect(response.status).toBe(400);
  });

  it('forwards a valid submission to the webhook with camelCase payload + header auth and returns 200', async () => {
    const fetchSpy = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, partnerId: 'test-id' }), {
        status: 200,
      }),
    );
    global.fetch = fetchSpy;

    const { POST } = await loadRoute();
    const response = await POST(buildRequest({ ip: '203.0.113.20' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://hooks.example/test');
    expect(init.method).toBe('POST');
    expect(init.headers['X-Application-Secret']).toBe('test-key-abc123');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body as string)).toEqual({
      email: 'a@b.co',
      firstName: 'Ada',
      lastName: 'Lovelace',
      companyName: 'Analytical Engines',
      domainName: 'https://analytical.example/',
    });
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('forwards rich optional wizard fields with camelCase keys', async () => {
    const fetchSpy = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );
    global.fetch = fetchSpy;

    const { POST } = await loadRoute();
    const response = await POST(
      buildRequest({
        body: JSON.stringify({
          ...VALID_PAYLOAD,
          country: 'FRANCE',
          languages: ['ENGLISH', 'FRENCH'],
          typeOfTeam: 'SOLO',
          partnerScope: ['ADVISORY'],
          hourlyRate: 150,
        }),
        ip: '203.0.113.24',
      }),
    );

    expect(response.status).toBe(200);
    const [, init] = fetchSpy.mock.calls[0];
    expect(JSON.parse(init.body as string)).toMatchObject({
      country: 'FRANCE',
      languages: ['ENGLISH', 'FRENCH'],
      typeOfTeam: 'SOLO',
      partnerScope: ['ADVISORY'],
      hourlyRate: 150,
    });
  });

  it('omits optional rich fields when not provided', async () => {
    const fetchSpy = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );
    global.fetch = fetchSpy;

    const { POST } = await loadRoute();
    const response = await POST(buildRequest({ ip: '203.0.113.25' }));

    expect(response.status).toBe(200);
    const [, init] = fetchSpy.mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body).not.toHaveProperty('country');
    expect(body).not.toHaveProperty('languages');
    expect(body).not.toHaveProperty('partnerScope');
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

  it('returns 502 when the webhook returns ok:false in its body', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: false }), { status: 200 }),
      );
    const { POST } = await loadRoute();
    const response = await POST(buildRequest({ ip: '203.0.113.26' }));
    expect(response.status).toBe(502);
  });

  it('returns 504 when the webhook surfaces an AbortError (timeout path)', async () => {
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
    // mockImplementation (not mockResolvedValue): each call needs a fresh
    // Response since the route consumes its body, and this test reads five.
    global.fetch = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ ok: true }), { status: 200 }),
        ),
      );
    const { POST } = await loadRoute();
    const ip = '203.0.113.99';
    const statuses = await runSequentially(() => POST(buildRequest({ ip })), 6);
    expect(statuses.slice(0, 5).every((status) => status === 200)).toBe(true);
    expect(statuses[5]).toBe(429);
  });

  it('attaches a Retry-After header on 429 responses', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );
    const { POST } = await loadRoute();
    const ip = '203.0.113.100';
    await runSequentially(() => POST(buildRequest({ ip })), 5);
    const denied = await POST(buildRequest({ ip }));
    expect(denied.status).toBe(429);
    const retryAfter = denied.headers.get('Retry-After');
    expect(retryAfter).not.toBeNull();
    expect(Number.parseInt(retryAfter ?? '0', 10)).toBeGreaterThan(0);
  });
});
