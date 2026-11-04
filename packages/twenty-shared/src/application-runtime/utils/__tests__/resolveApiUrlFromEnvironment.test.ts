import { resolveApiUrlFromEnvironment } from '@/application-runtime/utils/resolveApiUrlFromEnvironment';

describe('resolveApiUrlFromEnvironment', () => {
  it('prefers the internal API url', () => {
    expect(
      resolveApiUrlFromEnvironment({
        TWENTY_API_URL: 'https://api.example.com',
        TWENTY_INTERNAL_API_URL: 'http://twenty-server:3000',
      }),
    ).toBe('http://twenty-server:3000');
  });

  it.each([undefined, ''])(
    'falls back to the public API url when the internal one is %p',
    (internalApiUrl) => {
      expect(
        resolveApiUrlFromEnvironment({
          TWENTY_API_URL: 'https://api.example.com',
          TWENTY_INTERNAL_API_URL: internalApiUrl,
        }),
      ).toBe('https://api.example.com');
    },
  );

  it('returns undefined when neither url is set', () => {
    expect(resolveApiUrlFromEnvironment({})).toBeUndefined();
  });
});
