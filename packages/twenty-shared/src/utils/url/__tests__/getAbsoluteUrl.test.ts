import { getAbsoluteUrl } from '@/utils/url/getAbsoluteUrl';

describe('getAbsoluteUrl', () => {
  it('should return https URL as-is', () => {
    expect(getAbsoluteUrl('https://example.com')).toBe('https://example.com');
  });

  it('should return http URL as-is', () => {
    expect(getAbsoluteUrl('http://example.com')).toBe('http://example.com');
  });

  it('should return HTTPS URL as-is', () => {
    expect(getAbsoluteUrl('HTTPS://example.com')).toBe('HTTPS://example.com');
  });

  it('should return HTTP URL as-is', () => {
    expect(getAbsoluteUrl('HTTP://example.com')).toBe('HTTP://example.com');
  });

  it('should prepend https:// to bare domains', () => {
    expect(getAbsoluteUrl('example.com')).toBe('https://example.com');
  });
});
