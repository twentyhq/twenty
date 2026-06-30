import { isSafeHttpUrl } from './is-safe-http-url';

describe('isSafeHttpUrl', () => {
  it.each([
    'https://cal.com/partner',
    'http://example.com',
    'https://linkedin.com/company/acme',
  ])('accepts the http(s) URL %s', (url) => {
    expect(isSafeHttpUrl(url)).toBe(true);
  });

  it.each([
    '',
    'not-a-url',
    'javascript:alert(1)',
    'data:text/html,<x>',
    'ftp://host/file',
  ])('rejects the unsafe or malformed URL %s', (url) => {
    expect(isSafeHttpUrl(url)).toBe(false);
  });
});
