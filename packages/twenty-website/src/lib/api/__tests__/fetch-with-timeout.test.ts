import { fetchWithTimeout } from '@/lib/api/fetch-with-timeout';

describe('fetchWithTimeout', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns the response when the upstream resolves before the timeout', async () => {
    const mockResponse = new Response('ok', { status: 200 });
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    const result = await fetchWithTimeout(
      'https://example.com/',
      { method: 'POST' },
      { timeoutMs: 1000 },
    );

    expect(result).toEqual({ ok: true, response: mockResponse });
  });

  it('forwards method, headers, and body to the underlying fetch', async () => {
    const fetchSpy = jest
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));
    global.fetch = fetchSpy;

    await fetchWithTimeout(
      'https://example.com/',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{"a":1}',
      },
      { timeoutMs: 1000 },
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://example.com/');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'content-type': 'application/json' });
    expect(init.body).toBe('{"a":1}');
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('returns a `timeout` result when the upstream hangs past the timeout', async () => {
    global.fetch = jest.fn((...args: Parameters<typeof fetch>) => {
      const init = args[1];
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
        });
      });
    });

    const start = Date.now();
    const result = await fetchWithTimeout(
      'https://example.com/',
      { method: 'POST' },
      { timeoutMs: 50 },
    );
    const elapsed = Date.now() - start;

    expect(result).toEqual({ ok: false, error: 'timeout' });
    expect(elapsed).toBeGreaterThanOrEqual(40);
    expect(elapsed).toBeLessThan(500);
  });

  it('returns a `network` result for non-abort errors', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('connection refused'));

    const result = await fetchWithTimeout(
      'https://example.com/',
      { method: 'POST' },
      { timeoutMs: 1000 },
    );

    expect(result).toEqual({ ok: false, error: 'network' });
  });

  it('clears the timer on success so the process does not hang', async () => {
    jest.useFakeTimers();
    try {
      global.fetch = jest
        .fn()
        .mockResolvedValue(new Response(null, { status: 200 }));

      await fetchWithTimeout(
        'https://example.com/',
        { method: 'GET' },
        { timeoutMs: 5000 },
      );

      expect(jest.getTimerCount()).toBe(0);
    } finally {
      jest.useRealTimers();
    }
  });

  it('clears the timer on failure too', async () => {
    jest.useFakeTimers();
    try {
      global.fetch = jest.fn().mockRejectedValue(new Error('boom'));

      await fetchWithTimeout(
        'https://example.com/',
        { method: 'GET' },
        { timeoutMs: 5000 },
      );

      expect(jest.getTimerCount()).toBe(0);
    } finally {
      jest.useRealTimers();
    }
  });
});
