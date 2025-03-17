import { absoluteUrlSchema } from '@/utils/url/absoluteUrlSchema';

describe('absoluteUrlSchema', () => {
  it('validates an absolute url', () => {
    expect(absoluteUrlSchema.parse('https://www.example.com')).toBe(
      'https://www.example.com',
    );
    expect(absoluteUrlSchema.parse('http://subdomain.example.com')).toBe(
      'http://subdomain.example.com',
    );
    expect(absoluteUrlSchema.parse('https://www.example.com/path')).toBe(
      'https://www.example.com/path',
    );
    expect(absoluteUrlSchema.parse('https://www.example.com?query=123')).toBe(
      'https://www.example.com?query=123',
    );
    expect(absoluteUrlSchema.parse('http://localhost:3000')).toBe(
      'http://localhost:3000',
    );
  });

  it('transforms a non-absolute URL to an absolute URL', () => {
    expect(absoluteUrlSchema.parse('example.com')).toBe('https://example.com');
    expect(absoluteUrlSchema.parse('www.subdomain.example.com')).toBe(
      'https://www.subdomain.example.com',
    );
  });

  it('fails for invalid urls', () => {
    expect(absoluteUrlSchema.safeParse('https://2').success).toBe(false);
    expect(absoluteUrlSchema.safeParse('?o').success).toBe(false);
    expect(absoluteUrlSchema.safeParse('\\').success).toBe(false);
  });
});
