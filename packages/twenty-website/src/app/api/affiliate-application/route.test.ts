// oxlint-disable-next-line unicorn/require-module-specifiers -- isolate from the other route.test globals
export {};

const ORIGINAL_FETCH = global.fetch;
const ORIGINAL_WEBHOOK_URL = process.env.AFFILIATE_APPLICATION_WEBHOOK_URL;
const ORIGINAL_SECRET = process.env.AFFILIATE_APPLICATION_SECRET;

const VALID_PAYLOAD = {
  name: 'Ada Lovelace',
  email: 'Ada@Example.com',
  partnerType: 'CONTENT_CREATOR',
  acceptsTerms: true,
};

function buildRequest({
  body = JSON.stringify(VALID_PAYLOAD),
  ip = '198.51.100.1',
}: {
  body?: string;
  ip?: string;
} = {}) {
  return new Request('https://example.com/api/affiliate-application', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body,
  });
}

function mockWebhookReply(reply: object) {
  const fetchSpy = jest
    .fn()
    .mockResolvedValue(new Response(JSON.stringify(reply), { status: 200 }));
  global.fetch = fetchSpy;
  return fetchSpy;
}

async function loadRoute() {
  jest.resetModules();
  return import('@/app/api/affiliate-application/route');
}

describe('POST /api/affiliate-application', () => {
  beforeEach(() => {
    process.env.AFFILIATE_APPLICATION_WEBHOOK_URL =
      'https://hooks.example/workflow';
    process.env.AFFILIATE_APPLICATION_SECRET = 'test-secret-abc123';
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    global.fetch = ORIGINAL_FETCH;
    process.env.AFFILIATE_APPLICATION_WEBHOOK_URL = ORIGINAL_WEBHOOK_URL;
    process.env.AFFILIATE_APPLICATION_SECRET = ORIGINAL_SECRET;
  });

  it('forwards the workflow payload with the secret in the body and accepts success:true', async () => {
    const fetchSpy = mockWebhookReply({
      success: true,
      workflowRunId: 'run-id',
    });
    const { POST } = await loadRoute();

    const response = await POST(buildRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://hooks.example/workflow');
    expect(JSON.parse(init.body)).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      partnerType: 'CONTENT_CREATOR',
      mainChannelUrl: '',
      audienceSize: '',
      country: '',
      promotionPlan: '',
      isIntegrationPartner: false,
      applicationSecret: 'test-secret-abc123',
    });
  });

  it('returns 502 when the workflow answers ok:true instead of success:true', async () => {
    mockWebhookReply({ ok: true });
    const { POST } = await loadRoute();

    const response = await POST(buildRequest({ ip: '198.51.100.2' }));

    expect(response.status).toBe(502);
  });

  it('returns 503 when the webhook URL is not set', async () => {
    delete process.env.AFFILIATE_APPLICATION_WEBHOOK_URL;
    const fetchSpy = mockWebhookReply({ success: true });
    const { POST } = await loadRoute();

    const response = await POST(buildRequest({ ip: '198.51.100.3' }));

    expect(response.status).toBe(503);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns 503 without calling the workflow when the secret is not set', async () => {
    delete process.env.AFFILIATE_APPLICATION_SECRET;
    const fetchSpy = mockWebhookReply({ success: true });
    const { POST } = await loadRoute();

    const response = await POST(buildRequest({ ip: '198.51.100.5' }));

    expect(response.status).toBe(503);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns 400 when the promotion plan is over the length limit', async () => {
    const fetchSpy = mockWebhookReply({ success: true });
    const { POST } = await loadRoute();

    const response = await POST(
      buildRequest({
        body: JSON.stringify({
          ...VALID_PAYLOAD,
          promotionPlan: 'a'.repeat(2001),
        }),
        ip: '198.51.100.4',
      }),
    );

    expect(response.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
