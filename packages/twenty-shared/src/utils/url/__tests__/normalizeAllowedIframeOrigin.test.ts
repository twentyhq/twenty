import { normalizeAllowedIframeOrigin } from '../normalizeAllowedIframeOrigin';

describe('normalizeAllowedIframeOrigin', () => {
  it.each([
    ['https://PORTAL.example.com/', 'https://portal.example.com'],
    ['https://portal.example.com:443', 'https://portal.example.com'],
    ['https://portal.example.com:8443', 'https://portal.example.com:8443'],
    ['https://localhost', 'https://localhost'],
    ['http://PORTAL.corp.lan:80/', 'http://portal.corp.lan'],
    ['http://localhost:3001', 'http://localhost:3001'],
  ])('normalizes %s', (value, expected) => {
    expect(normalizeAllowedIframeOrigin(value)).toBe(expected);
  });

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
    expect(normalizeAllowedIframeOrigin(value)).toBeUndefined();
  });
});
