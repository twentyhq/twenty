import { normalizeUrl } from '@/utils/url/normalizeUrl';

describe('normalizeUrl', () => {
  it('should return empty string for empty or whitespace input', () => {
    expect(normalizeUrl('')).toBe('');
    expect(normalizeUrl('   ')).toBe('');
  });

  it('should prepend https and normalize origin for bare domains', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
    expect(normalizeUrl('  example.com  ')).toBe('https://example.com');
  });

  it('should lowercase the origin and preserve the path', () => {
    expect(normalizeUrl('HTTPS://WWW.Example.COM/Path')).toBe(
      'https://www.example.com/Path',
    );
  });

  it('should remove trailing slash', () => {
    expect(normalizeUrl('https://example.com/')).toBe('https://example.com');
  });

  it('should preserve percent-encoded sequences', () => {
    expect(normalizeUrl('https://example.com/path%2Fencoded')).toBe(
      'https://example.com/path%2Fencoded',
    );
  });
});
