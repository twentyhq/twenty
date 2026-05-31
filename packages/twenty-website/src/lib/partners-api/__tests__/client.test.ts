import { partnersApiFetch } from '@/lib/partners-api/client';

describe('partnersApiFetch', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = {
      ...ORIGINAL_ENV,
      TWENTY_PARTNERS_API_URL: 'https://twenty.example.com',
      TWENTY_PARTNERS_API_KEY: 'test-key-123',
    };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.restoreAllMocks();
  });

  it('throws a clear error when TWENTY_PARTNERS_API_URL is missing', async () => {
    delete process.env.TWENTY_PARTNERS_API_URL;

    await expect(partnersApiFetch('/rest/people')).rejects.toThrow(
      /TWENTY_PARTNERS_API_URL/,
    );
  });

  it('throws a clear error when TWENTY_PARTNERS_API_KEY is missing', async () => {
    delete process.env.TWENTY_PARTNERS_API_KEY;

    await expect(partnersApiFetch('/rest/people')).rejects.toThrow(
      /TWENTY_PARTNERS_API_KEY/,
    );
  });

  it('sends Authorization: Bearer header and returns parsed JSON on 2xx', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const result = await partnersApiFetch('/rest/people');

    expect(result).toEqual({ ok: true });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://twenty.example.com/rest/people');
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer test-key-123',
      Accept: 'application/json',
    });
    expect((init as RequestInit).cache).toBeUndefined();
  });

  it('throws on non-2xx with status, path, and body snippet', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('Workspace not found', { status: 404 }));

    await expect(partnersApiFetch('/rest/people')).rejects.toThrow(
      /404.*\/rest\/people.*Workspace not found/s,
    );
  });

  it('lets the caller override cache and merges headers', async () => {
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }));

    await partnersApiFetch('/rest/people', {
      cache: 'force-cache',
      headers: { 'X-Custom': 'yes' },
    });

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(init.cache).toBe('force-cache');
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer test-key-123',
      Accept: 'application/json',
      'x-custom': 'yes',
    });
  });
});
