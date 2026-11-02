import { normalizeIframeOrigin } from '../normalizeIframeOrigin';

describe('normalizeIframeOrigin', () => {
  it.each([
    ['https://PORTAL.example.com/', 'https://portal.example.com'],
    ['https://portal.example.com:443', 'https://portal.example.com'],
    ['https://portal.example.com:8443', 'https://portal.example.com:8443'],
    ['https://localhost', 'https://localhost'],
    ['http://PORTAL.corp.lan:80/', 'http://portal.corp.lan'],
    ['http://localhost:3001', 'http://localhost:3001'],
  ])('normalizes %s', (value, expected) => {
    expect(normalizeIframeOrigin(value)).toBe(expected);
  });

  it.each(['http://[::1]:3000', 'https://[2001:db8::1]'])(
    'rejects IPv6 literals unsupported by CSP host sources: %s',
    (value) => {
      expect(normalizeIframeOrigin(value)).toBeUndefined();
    },
  );

  it.each([
    '*',
    'null',
    'https://*.example.com',
    'https://example.com/path',
    'https://example.com/.',
    'https://example.com?',
    'https://example.com#',
    'https://@example.com',
    'https://example.com?query=1',
    'https://example.com#fragment',
    'https://user:password@example.com',
    'https://example.com;script-src',
    'https://example.com\r\nX-Test: yes',
    'https://example.com https://evil.com',
    'https:example.com',
    'https://example.com\\evil',
    'https://example..com',
  ])('rejects %s', (value) => {
    expect(normalizeIframeOrigin(value)).toBeUndefined();
  });

  describe('with isHttpsOnly', () => {
    it('normalizes exact HTTPS origins', () => {
      expect(
        normalizeIframeOrigin('https://PHONE.example.com:443/', {
          isHttpsOnly: true,
        }),
      ).toBe('https://phone.example.com');
    });

    it.each([
      'http://phone.example.com',
      'https://*.example.com',
      'https://phone.example.com/calls',
      'https://user@phone.example.com',
      'https://phone.example.com?camera=true',
      'https://phone.example.com\n',
      'data:text/html,phone',
    ])('rejects %s', (origin) => {
      expect(
        normalizeIframeOrigin(origin, { isHttpsOnly: true }),
      ).toBeUndefined();
    });
  });
});
