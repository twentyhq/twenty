import { ensureAbsoluteUrl } from '@/utils/url/ensureAbsoluteUrl';

describe('ensureAbsoluteUrl', () => {
  it('should return https URL as-is (trimmed)', () => {
    expect(ensureAbsoluteUrl('https://example.com')).toBe(
      'https://example.com',
    );
  });

  it('should return http URL as-is', () => {
    expect(ensureAbsoluteUrl('http://example.com')).toBe('http://example.com');
  });

  it('should return HTTPS URL as-is', () => {
    expect(ensureAbsoluteUrl('HTTPS://example.com')).toBe(
      'HTTPS://example.com',
    );
  });

  it('should return HTTP URL as-is', () => {
    expect(ensureAbsoluteUrl('HTTP://example.com')).toBe('HTTP://example.com');
  });

  it('should return mixed-case scheme URL as-is when it is already absolute', () => {
    expect(ensureAbsoluteUrl('Https://example.com')).toBe(
      'Https://example.com',
    );
    expect(ensureAbsoluteUrl('Http://example.com')).toBe('Http://example.com');
    expect(ensureAbsoluteUrl('HttpS://example.com')).toBe(
      'HttpS://example.com',
    );
  });

  it('should not prepend https:// to a mixed-case absolute URL', () => {
    expect(ensureAbsoluteUrl('Https://example.com')).not.toContain(
      'https://Https://',
    );
  });

  it('should prepend https:// to bare domains', () => {
    expect(ensureAbsoluteUrl('example.com')).toBe('https://example.com');
  });

  it('should trim whitespace before processing', () => {
    expect(ensureAbsoluteUrl('  example.com  ')).toBe('https://example.com');
    expect(ensureAbsoluteUrl('  https://example.com  ')).toBe(
      'https://example.com',
    );
  });
});
