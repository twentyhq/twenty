import { getURLSafely } from '@/utils/getURLSafely';

describe('getURLSafely', () => {
  it('should return a URL object for a valid URL', () => {
    const result = getURLSafely('https://example.com');

    expect(result).toBeInstanceOf(URL);
    expect(result?.hostname).toBe('example.com');
  });

  it('should return null for an invalid URL', () => {
    const result = getURLSafely('not-a-url');

    expect(result).toBeNull();
  });
});
