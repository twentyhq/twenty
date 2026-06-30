import { createBasicDigestAuthFetch } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/lib/auth/create-basic-digest-auth-fetch';

const mockFetch = (handle: (init?: RequestInit) => Response) => {
  const calls: (RequestInit | undefined)[] = [];
  const fn = jest.fn(async (_input, init) => {
    calls.push(init);

    return handle(init);
  });

  return { calls, fn: fn as unknown as typeof fetch };
};

const digest401 = () =>
  new Response('', {
    status: 401,
    headers: {
      'WWW-Authenticate':
        'Digest realm="NMMDav", qop="auth", nonce="n", opaque="o"',
    },
  });

describe('createBasicDigestAuthFetch', () => {
  it('attaches Basic on the first request so Basic-only servers succeed in one round trip', async () => {
    const { calls, fn } = mockFetch(() => new Response('ok', { status: 207 }));

    await createBasicDigestAuthFetch(
      'Aladdin',
      'open sesame',
      fn,
    )('https://example.test/cal/');

    expect(calls).toHaveLength(1);
    expect(new Headers(calls[0]?.headers).get('Authorization')).toBe(
      `Basic ${Buffer.from('Aladdin:open sesame', 'utf8').toString('base64')}`,
    );
  });

  it('upgrades to Digest on 401 and routes the retry through the supplied fetch, never globalThis.fetch', async () => {
    const forbiddenGlobal = jest.fn(async () => {
      throw new Error('globalThis.fetch must not be called');
    });
    const original = globalThis.fetch;

    globalThis.fetch = forbiddenGlobal as unknown as typeof fetch;

    try {
      const { calls, fn } = mockFetch((init) =>
        new Headers(init?.headers).get('Authorization')?.startsWith('Digest ')
          ? new Response('ok', { status: 207 })
          : digest401(),
      );

      const response = await createBasicDigestAuthFetch(
        'user',
        'pass',
        fn,
      )('https://example.test/cal/', { method: 'PROPFIND' });

      expect(response.status).toBe(207);
      expect(calls).toHaveLength(2);
      expect(new Headers(calls[1]?.headers).get('Authorization')).toMatch(
        /^Digest .*realm="NMMDav".*opaque="o"/,
      );
      expect(forbiddenGlobal).not.toHaveBeenCalled();
    } finally {
      globalThis.fetch = original;
    }
  });

  it('surfaces the 401 when the Digest retry is also rejected', async () => {
    const { fn } = mockFetch(() => digest401());

    const response = await createBasicDigestAuthFetch(
      'user',
      'wrong-pass',
      fn,
    )('https://example.test/');

    expect(response.status).toBe(401);
  });
});
