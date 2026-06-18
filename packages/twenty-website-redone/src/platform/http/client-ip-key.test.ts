import { getClientIpKey } from '@/platform/http/client-ip-key';

function requestWithHeaders(headers: Record<string, string>): Request {
  return new Request('https://example.com/', { headers });
}

describe('getClientIpKey', () => {
  it('uses the first entry in x-forwarded-for', () => {
    expect(
      getClientIpKey(
        requestWithHeaders({ 'x-forwarded-for': '203.0.113.5, 10.0.0.1' }),
      ),
    ).toBe('203.0.113.5');
  });

  it('trims whitespace in x-forwarded-for', () => {
    expect(
      getClientIpKey(
        requestWithHeaders({ 'x-forwarded-for': '  198.51.100.7  ' }),
      ),
    ).toBe('198.51.100.7');
  });

  it('falls back to x-real-ip', () => {
    expect(
      getClientIpKey(requestWithHeaders({ 'x-real-ip': '198.51.100.9' })),
    ).toBe('198.51.100.9');
  });

  it('returns "unknown" when no proxy headers are present', () => {
    expect(getClientIpKey(requestWithHeaders({}))).toBe('unknown');
  });

  it('falls through an empty x-forwarded-for to x-real-ip then unknown', () => {
    expect(getClientIpKey(requestWithHeaders({ 'x-forwarded-for': '' }))).toBe(
      'unknown',
    );
    expect(
      getClientIpKey(
        requestWithHeaders({ 'x-forwarded-for': '', 'x-real-ip': '1.2.3.4' }),
      ),
    ).toBe('1.2.3.4');
  });
});
