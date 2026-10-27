import { isHttpUrl } from '@/utils/url/isHttpUrl';

describe('isHttpUrl', () => {
  it('accepts http and https urls', () => {
    expect(isHttpUrl('https://example.com')).toBe(true);
    expect(isHttpUrl('http://localhost:3000/mcp')).toBe(true);
    expect(isHttpUrl('HTTPS://example.com/path?query=1')).toBe(true);
  });

  it('rejects other protocols', () => {
    expect(isHttpUrl('ftp://example.com')).toBe(false);
    expect(isHttpUrl('mailto:someone@example.com')).toBe(false);
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
  });
});
