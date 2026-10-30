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
});
