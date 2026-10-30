import { getCloudflareContext } from '@opennextjs/cloudflare';

import { forwardToTwentyConnect } from './forward-to-twenty-connect';

jest.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: jest.fn(),
}));

const mockedGetCloudflareContext = getCloudflareContext as jest.Mock;

const buildRequest = () =>
  new Request('https://twenty.com/api/enterprise/validate?trace=1', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ enterpriseKey: 'key' }),
  });

describe('forwardToTwentyConnect', () => {
  const originalForwardingFlag = process.env.TWENTY_CONNECT_FORWARDING_ENABLED;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TWENTY_CONNECT_FORWARDING_ENABLED = 'true';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env.TWENTY_CONNECT_FORWARDING_ENABLED = originalForwardingFlag;
  });

  it('should forward to the twenty-connect enterprise path with method, headers, query and body', async () => {
    const connectFetch = jest
      .fn()
      .mockResolvedValue(Response.json({ validityToken: 'token' }));
    mockedGetCloudflareContext.mockResolvedValue({
      env: { TWENTY_CONNECT: { fetch: connectFetch } },
    });

    const response = await forwardToTwentyConnect(buildRequest());

    expect(await response?.json()).toEqual({ validityToken: 'token' });

    expect(connectFetch).toHaveBeenCalledTimes(1);
    expect(mockedGetCloudflareContext).toHaveBeenCalledTimes(1);
    expect(mockedGetCloudflareContext).toHaveBeenCalledWith({ async: true });

    const forwardedRequest: Request = connectFetch.mock.calls[0][0];

    expect(forwardedRequest.url).toBe(
      'https://twenty.com/v1/enterprise/validate?trace=1',
    );
    expect(forwardedRequest.method).toBe('POST');
    expect(forwardedRequest.headers.get('content-type')).toBe(
      'application/json',
    );
    expect(await forwardedRequest.json()).toEqual({ enterpriseKey: 'key' });
  });

  it('should answer locally when forwarding is disabled', async () => {
    process.env.TWENTY_CONNECT_FORWARDING_ENABLED = 'false';

    await expect(forwardToTwentyConnect(buildRequest())).resolves.toBeNull();
    expect(mockedGetCloudflareContext).not.toHaveBeenCalled();
  });

  it('should answer locally when the binding is missing', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedGetCloudflareContext.mockResolvedValue({ env: {} });

    await expect(forwardToTwentyConnect(buildRequest())).resolves.toBeNull();
  });

  it('should preserve the raw webhook body and Stripe signature without processing it twice', async () => {
    const rawBody = '{ "type": "checkout.session.completed", "data": "é" }\n';
    const stripeSignature = 't=123,v1=test-signature';
    const connectFetch = jest.fn().mockResolvedValue(new Response('ok'));
    mockedGetCloudflareContext.mockResolvedValue({
      env: { TWENTY_CONNECT: { fetch: connectFetch } },
    });

    const response = await forwardToTwentyConnect(
      new Request('https://twenty.com/api/enterprise/stripe-webhook', {
        method: 'POST',
        headers: { 'stripe-signature': stripeSignature },
        body: rawBody,
      }),
    );

    expect(await response?.text()).toBe('ok');
    expect(connectFetch).toHaveBeenCalledTimes(1);

    const forwardedRequest: Request = connectFetch.mock.calls[0][0];

    expect(forwardedRequest.url).toBe(
      'https://twenty.com/v1/enterprise/stripe-webhook',
    );
    expect(forwardedRequest.headers.get('stripe-signature')).toBe(
      stripeSignature,
    );
    expect(Buffer.from(await forwardedRequest.arrayBuffer())).toEqual(
      Buffer.from(rawBody),
    );
  });

  it('should leave the body available to the local handler when Cloudflare context fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedGetCloudflareContext.mockRejectedValue(
      new Error('Context unavailable'),
    );
    const request = buildRequest();

    await expect(forwardToTwentyConnect(request)).resolves.toBeNull();
    expect(await request.json()).toEqual({ enterpriseKey: 'key' });
  });

  it('should propagate forwarding errors without falling through to local processing', async () => {
    const error = new Error('Connect unavailable');
    const connectFetch = jest.fn().mockRejectedValue(error);
    mockedGetCloudflareContext.mockResolvedValue({
      env: { TWENTY_CONNECT: { fetch: connectFetch } },
    });

    await expect(forwardToTwentyConnect(buildRequest())).rejects.toBe(error);
    expect(connectFetch).toHaveBeenCalledTimes(1);
  });
});
