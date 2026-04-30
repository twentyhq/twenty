import { createRateLimiter, getClientIpKey } from '@/lib/api/rate-limit';

describe('createRateLimiter', () => {
  it('rejects invalid options', () => {
    expect(() => createRateLimiter({ capacity: 0, refillPerSec: 1 })).toThrow(
      'capacity',
    );
    expect(() => createRateLimiter({ capacity: 1, refillPerSec: 0 })).toThrow(
      'refillPerSec',
    );
  });

  it('allows up to `capacity` requests instantly per key', () => {
    let now = 1_000_000;
    const limiter = createRateLimiter(
      { capacity: 3, refillPerSec: 1 },
      () => now,
    );

    expect(limiter('a')).toEqual({ allowed: true, remaining: 2 });
    expect(limiter('a')).toEqual({ allowed: true, remaining: 1 });
    expect(limiter('a')).toEqual({ allowed: true, remaining: 0 });
  });

  it('rejects the next request after the burst is spent and reports retryAfterMs', () => {
    let now = 1_000_000;
    const limiter = createRateLimiter(
      { capacity: 2, refillPerSec: 1 },
      () => now,
    );

    limiter('a');
    limiter('a');
    const denied = limiter('a');
    expect(denied.allowed).toBe(false);
    if (!denied.allowed) {
      expect(denied.retryAfterMs).toBeGreaterThan(0);
      expect(denied.retryAfterMs).toBeLessThanOrEqual(1000);
    }
  });

  it('refills tokens linearly over time', () => {
    let now = 0;
    const limiter = createRateLimiter(
      { capacity: 5, refillPerSec: 2 },
      () => now,
    );

    limiter('a');
    limiter('a');
    limiter('a');
    limiter('a');
    limiter('a');
    expect(limiter('a').allowed).toBe(false);

    now += 500;
    expect(limiter('a')).toEqual({ allowed: true, remaining: 0 });

    now += 500;
    expect(limiter('a')).toEqual({ allowed: true, remaining: 0 });

    now += 2_000;
    const result = limiter('a');
    expect(result.allowed).toBe(true);
    if (result.allowed) {
      expect(result.remaining).toBeGreaterThanOrEqual(2);
      expect(result.remaining).toBeLessThanOrEqual(4);
    }
  });

  it('caps refilled tokens at `capacity` (no negative interest)', () => {
    let now = 0;
    const limiter = createRateLimiter(
      { capacity: 2, refillPerSec: 1 },
      () => now,
    );

    limiter('a');
    limiter('a');
    expect(limiter('a').allowed).toBe(false);

    now += 60_000;
    expect(limiter('a')).toEqual({ allowed: true, remaining: 1 });
    expect(limiter('a')).toEqual({ allowed: true, remaining: 0 });
    expect(limiter('a').allowed).toBe(false);
  });

  it('keeps separate buckets per key', () => {
    let now = 0;
    const limiter = createRateLimiter(
      { capacity: 1, refillPerSec: 1 },
      () => now,
    );

    expect(limiter('alice').allowed).toBe(true);
    expect(limiter('bob').allowed).toBe(true);
    expect(limiter('alice').allowed).toBe(false);
    expect(limiter('bob').allowed).toBe(false);
  });

  it('treats time going backwards as zero elapsed (clock guard)', () => {
    let now = 1_000_000;
    const limiter = createRateLimiter(
      { capacity: 2, refillPerSec: 10 },
      () => now,
    );

    limiter('a');
    limiter('a');
    now -= 60_000;
    expect(limiter('a').allowed).toBe(false);
  });
});

describe('getClientIpKey', () => {
  function req(headers: Record<string, string>): Request {
    return new Request('https://example.com/', { headers });
  }

  it('uses the first entry in x-forwarded-for', () => {
    expect(
      getClientIpKey(req({ 'x-forwarded-for': '203.0.113.5, 10.0.0.1' })),
    ).toBe('203.0.113.5');
  });

  it('trims whitespace in x-forwarded-for', () => {
    expect(getClientIpKey(req({ 'x-forwarded-for': '  198.51.100.7  ' }))).toBe(
      '198.51.100.7',
    );
  });

  it('falls back to x-real-ip', () => {
    expect(getClientIpKey(req({ 'x-real-ip': '198.51.100.9' }))).toBe(
      '198.51.100.9',
    );
  });

  it('returns "unknown" when no proxy headers are present', () => {
    expect(getClientIpKey(req({}))).toBe('unknown');
  });

  it('falls through an empty x-forwarded-for to x-real-ip then unknown', () => {
    expect(getClientIpKey(req({ 'x-forwarded-for': '' }))).toBe('unknown');
    expect(
      getClientIpKey(req({ 'x-forwarded-for': '', 'x-real-ip': '1.2.3.4' })),
    ).toBe('1.2.3.4');
  });
});
