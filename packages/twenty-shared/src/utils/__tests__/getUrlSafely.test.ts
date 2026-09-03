import { getUrlSafely } from '@/utils/getUrlSafely';

describe('getUrlSafely', () => {
  it('should return a URL object for a valid URL', () => {
    const result = getUrlSafely('https://example.com');

    expect(result).toBeInstanceOf(URL);
    expect(result?.hostname).toBe('example.com');
  });

  it('should return null for an invalid URL', () => {
    const result = getUrlSafely('not-a-url');

    expect(result).toBeNull();
  });
});
