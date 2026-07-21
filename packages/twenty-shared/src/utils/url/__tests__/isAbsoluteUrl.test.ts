import { isAbsoluteUrl } from '@/utils/url/isAbsoluteUrl';

describe('isAbsoluteUrl', () => {
  it('should return true for http and https urls', () => {
    expect(isAbsoluteUrl('http://example.com/logo.png')).toBe(true);
    expect(isAbsoluteUrl('https://example.com/logo.png')).toBe(true);
  });

  it('should match the scheme case-insensitively', () => {
    expect(isAbsoluteUrl('HTTPS://example.com/logo.png')).toBe(true);
    expect(isAbsoluteUrl('Http://example.com/logo.png')).toBe(true);
  });

  it('should return false for relative paths and other schemes', () => {
    expect(isAbsoluteUrl('public/logo.png')).toBe(false);
    expect(isAbsoluteUrl('/public/logo.png')).toBe(false);
    expect(isAbsoluteUrl('ftp://example.com/logo.png')).toBe(false);
    expect(isAbsoluteUrl('')).toBe(false);
  });
});
