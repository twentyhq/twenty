import { createRateLimiter } from '@/platform/http/rate-limit';

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
    const now = 1_000_000;
    const limiter = createRateLimiter(
      { capacity: 3, refillPerSec: 1 },
      () => now,
    );

    expect(limiter('a')).toEqual({ allowed: true, remaining: 2 });
    expect(limiter('a')).toEqual({ allowed: true, remaining: 1 });
    expect(limiter('a')).toEqual({ allowed: true, remaining: 0 });
  });

  it('rejects the next request after the burst is spent and reports retryAfterMs', () => {
    const now = 1_000_000;
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
    const now = 0;
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
