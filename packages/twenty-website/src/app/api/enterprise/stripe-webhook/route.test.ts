// oxlint-disable-next-line unicorn/require-module-specifiers -- isolate from the other route.test globals
export {};

const ORIGINAL_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const ORIGINAL_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const SUBSCRIPTION_ID = 'sub_new';

const constructEventAsync = jest.fn();
const recordTrialCard = jest.fn();

jest.mock('@/platform/enterprise', () => ({
  ...jest.requireActual('@/platform/enterprise'),
  getStripeClient: () => ({ webhooks: { constructEventAsync } }),
  recordTrialCard: (...args: unknown[]) => recordTrialCard(...args),
}));

const buildRequest = ({
  signature = 't=1,v1=deadbeef',
}: { signature?: string | null } = {}) => {
  const headers = new Headers();

  if (signature !== null) {
    headers.set('stripe-signature', signature);
  }

  return new Request('https://example.com/api/enterprise/stripe-webhook', {
    method: 'POST',
    headers,
    body: '{}',
  });
};

const loadRoute = async () => {
  jest.resetModules();

  return import('@/app/api/enterprise/stripe-webhook/route');
};

const checkoutCompleted = (subscription: unknown) => ({
  type: 'checkout.session.completed',
  data: { object: { subscription } },
});

describe('POST /api/enterprise/stripe-webhook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'info').mockImplementation(() => {});
    process.env.STRIPE_SECRET_KEY = 'sk_test';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    recordTrialCard.mockResolvedValue('first-trial-for-card');
  });

  afterAll(() => {
    process.env.STRIPE_SECRET_KEY = ORIGINAL_SECRET_KEY;
    process.env.STRIPE_WEBHOOK_SECRET = ORIGINAL_WEBHOOK_SECRET;
  });

  it('records the trial card on a signed checkout completion', async () => {
    constructEventAsync.mockResolvedValue(checkoutCompleted(SUBSCRIPTION_ID));
    const { POST } = await loadRoute();

    const response = await POST(buildRequest());

    expect(response.status).toBe(200);
    expect(recordTrialCard).toHaveBeenCalledTimes(1);
    expect(recordTrialCard).toHaveBeenCalledWith(
      expect.objectContaining({ subscriptionId: SUBSCRIPTION_ID }),
    );
  });

  it('reads the subscription id from an expanded subscription', async () => {
    constructEventAsync.mockResolvedValue(
      checkoutCompleted({ id: SUBSCRIPTION_ID }),
    );
    const { POST } = await loadRoute();

    await POST(buildRequest());

    expect(recordTrialCard).toHaveBeenCalledWith(
      expect.objectContaining({ subscriptionId: SUBSCRIPTION_ID }),
    );
  });

  it('rejects a request with no signature without calling Stripe', async () => {
    const { POST } = await loadRoute();

    const response = await POST(buildRequest({ signature: null }));

    expect(response.status).toBe(400);
    expect(constructEventAsync).not.toHaveBeenCalled();
    expect(recordTrialCard).not.toHaveBeenCalled();
  });

  it('rejects a forged signature', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    constructEventAsync.mockRejectedValue(new Error('no signatures found'));
    const { POST } = await loadRoute();

    const response = await POST(buildRequest({ signature: 't=1,v1=forged' }));

    expect(response.status).toBe(400);
    expect(recordTrialCard).not.toHaveBeenCalled();
  });

  it('acknowledges an event it does not act on', async () => {
    constructEventAsync.mockResolvedValue({ type: 'invoice.paid', data: {} });
    const { POST } = await loadRoute();

    const response = await POST(buildRequest());

    expect(response.status).toBe(200);
    expect(recordTrialCard).not.toHaveBeenCalled();
  });

  it('acknowledges a checkout that created no subscription', async () => {
    constructEventAsync.mockResolvedValue(checkoutCompleted(null));
    const { POST } = await loadRoute();

    const response = await POST(buildRequest());

    expect(response.status).toBe(200);
    expect(recordTrialCard).not.toHaveBeenCalled();
  });

  it('asks Stripe to redeliver when recording fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    constructEventAsync.mockResolvedValue(checkoutCompleted(SUBSCRIPTION_ID));
    recordTrialCard.mockRejectedValue(new Error('stripe is down'));
    const { POST } = await loadRoute();

    const response = await POST(buildRequest());

    expect(response.status).toBe(500);
  });

  it('is unconfigured without a webhook secret', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const { POST } = await loadRoute();

    const response = await POST(buildRequest());

    expect(response.status).toBe(503);
    expect(constructEventAsync).not.toHaveBeenCalled();
  });
});
