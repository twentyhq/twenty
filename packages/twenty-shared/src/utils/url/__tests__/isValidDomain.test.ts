import { isValidDomain } from '@/utils/url/isValidDomain';

describe('isValidDomain', () => {
  it.each([
    'twenty.com',
    'https://www.twenty.com/careers?x=1',
    'blog.twenty.com',
    'twenty.co.uk',
    'münchen.de',
    'twenty.com.',
    'twenty.com:8080',
  ])('should accept %s', (rawDomain) => {
    expect(isValidDomain(rawDomain)).toBe(true);
  });

  it.each([
    'not a domain',
    'twenty',
    'javascript:alert(1)',
    '<script>',
    'localhost',
    '192.168.1.1',
    '',
  ])('should reject %s', (rawDomain) => {
    expect(isValidDomain(rawDomain)).toBe(false);
  });

  it('should judge a backslash host the way a browser reads it', () => {
    expect(isValidDomain('twenty.com\\@evil.com')).toBe(true);
    expect(isValidDomain('twenty.com\\@not a domain')).toBe(true);
  });
});
