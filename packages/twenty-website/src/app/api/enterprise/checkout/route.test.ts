// oxlint-disable-next-line unicorn/require-module-specifiers -- isolate from the other route.test globals
export {};

const ORIGINAL_ENV = { ...process.env };

const SERVER_ID = 'server-1';

const search = jest.fn();
const createSession = jest.fn();

jest.mock('@/platform/enterprise', () => ({
  ...jest.requireActual('@/platform/enterprise'),
  getStripeClient: () => ({
    subscriptions: { search },
    checkout: { sessions: { create: createSession } },
  }),
}));

const buildRequest = (body: Record<string, unknown>) =>
  new Request('https://example.com/api/enterprise/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const loadRoute = async () => {
  jest.resetModules();

  return import('@/app/api/enterprise/checkout/route');
};

describe('POST /api/enterprise/checkout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test';
    process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID = 'price_monthly';
    process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID = 'price_yearly';
    process.env.NEXT_PUBLIC_WEBSITE_URL = 'https://example.com';
    search.mockResolvedValue({ data: [] });
    createSession.mockResolvedValue({ url: 'https://checkout.stripe.com/s' });
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('grants a trial to a server with no prior subscription and stamps it', async () => {
    const { POST } = await loadRoute();

    const response = await POST(
      buildRequest({ instanceMetadata: { serverId: SERVER_ID } }),
    );

    expect(response.status).toBe(200);
    expect(search).toHaveBeenCalledTimes(1);
    expect(createSession).toHaveBeenCalledTimes(1);
    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        subscription_data: {
          trial_period_days: 30,
          metadata: {
            source: 'enterprise-self-hosted',
            trialServerId: SERVER_ID,
          },
        },
      }),
    );
  });

  it('withholds the trial from a server that already had one', async () => {
    search.mockResolvedValue({ data: [{ id: 'sub_prior' }] });
    const { POST } = await loadRoute();

    const response = await POST(
      buildRequest({ instanceMetadata: { serverId: SERVER_ID } }),
    );

    expect(response.status).toBe(200);
    expect(createSession).toHaveBeenCalledTimes(1);
    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        subscription_data: {
          metadata: { source: 'enterprise-self-hosted' },
        },
      }),
    );
  });

  it.each([
    ['no instanceMetadata', {}],
    ['a null server id', { instanceMetadata: { serverId: null } }],
    ['a blank server id', { instanceMetadata: { serverId: '   ' } }],
    [
      'a server id Stripe search cannot take',
      { instanceMetadata: { serverId: "x' OR status:'active" } },
    ],
  ])('rejects a checkout with %s', async (_label, body) => {
    const { POST } = await loadRoute();

    const response = await POST(buildRequest(body));

    expect(response.status).toBe(400);
    expect(search).not.toHaveBeenCalled();
    expect(createSession).not.toHaveBeenCalled();
  });

  it('is unconfigured without a Stripe key', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    delete process.env.STRIPE_SECRET_KEY;
    const { POST } = await loadRoute();

    const response = await POST(
      buildRequest({ instanceMetadata: { serverId: SERVER_ID } }),
    );

    expect(response.status).toBe(503);
    expect(createSession).not.toHaveBeenCalled();
  });
});
