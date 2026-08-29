import { normalizeDomain } from '@/utils/url/normalizeDomain';

describe('normalizeDomain', () => {
  it.each([
    'twenty.com',
    'TWENTY.com',
    'www.twenty.com',
    'https://twenty.com',
    'https://www.twenty.com/',
    'http://www.Twenty.com/careers?utm=1#team',
    '  https://twenty.com  ',
    'twenty.com.',
    'twenty.com:8080',
    'https://user:secret@www.twenty.com',
    'ftp://twenty.com',
  ])('should reduce %s to the bare domain', (rawDomain) => {
    expect(normalizeDomain(rawDomain)).toBe('twenty.com');
  });

  it('should keep subdomains other than www', () => {
    expect(normalizeDomain('https://blog.twenty.com')).toBe('blog.twenty.com');
  });

  it('should fold an internationalized domain onto its punycode spelling', () => {
    expect(normalizeDomain('münchen.de')).toBe('xn--mnchen-3ya.de');
    expect(normalizeDomain('https://München.de')).toBe('xn--mnchen-3ya.de');
    expect(normalizeDomain('xn--mnchen-3ya.de')).toBe('xn--mnchen-3ya.de');
  });

  it('should read a backslash as a path separator, like a browser does', () => {
    expect(normalizeDomain('twenty.com\\@evil.com')).toBe('twenty.com');
    expect(normalizeDomain('https://twenty.com\\evil.com/x')).toBe(
      'twenty.com',
    );
  });

  it('should drop every user info segment', () => {
    expect(normalizeDomain('https://a@b@twenty.com')).toBe('twenty.com');
  });

  it('should strip every repeated www label and trailing dot in one pass', () => {
    expect(normalizeDomain('www.www.twenty.com')).toBe('twenty.com');
    expect(normalizeDomain('twenty.com..')).toBe('twenty.com');
  });

  it.each([
    'twenty.com',
    'https://www.twenty.com/careers?x=1',
    'www.www.twenty.com',
    'twenty.com..',
    'münchen.de',
    'not a domain',
    '',
  ])('should already be normalized after one pass for %s', (rawDomain) => {
    const normalized = normalizeDomain(rawDomain);

    expect(normalizeDomain(normalized)).toBe(normalized);
  });

  it('should return an empty string for an empty value', () => {
    expect(normalizeDomain('')).toBe('');
  });

  it('should hand back something unparseable rather than throwing', () => {
    expect(normalizeDomain('not a domain')).toBe('not a domain');
  });
});
