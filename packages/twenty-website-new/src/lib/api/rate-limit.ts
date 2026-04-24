export type RateLimitOptions = {
  capacity: number;
  refillPerSec: number;
};

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterMs: number };

type Bucket = {
  tokens: number;
  lastRefillMs: number;
};

const SOFT_BUCKET_CAP = 1024;

export function createRateLimiter(
  options: RateLimitOptions,
  now: () => number = Date.now,
): (key: string) => RateLimitResult {
  if (options.capacity <= 0) {
    throw new Error('createRateLimiter: capacity must be > 0');
  }
  if (options.refillPerSec <= 0) {
    throw new Error('createRateLimiter: refillPerSec must be > 0');
  }

  const buckets = new Map<string, Bucket>();
  const fullRefillMs = Math.ceil(
    (options.capacity / options.refillPerSec) * 1000,
  );

  return function check(key: string): RateLimitResult {
    const t = now();

    let tokens: number;
    const existing = buckets.get(key);
    if (existing == null) {
      tokens = options.capacity;
    } else {
      const elapsedSec = Math.max(0, (t - existing.lastRefillMs) / 1000);
      tokens = Math.min(
        options.capacity,
        existing.tokens + elapsedSec * options.refillPerSec,
      );
    }

    if (tokens < 1) {
      const deficit = 1 - tokens;
      const retryAfterMs = Math.ceil((deficit / options.refillPerSec) * 1000);
      buckets.set(key, { tokens, lastRefillMs: t });
      return { allowed: false, retryAfterMs };
    }

    tokens -= 1;
    buckets.set(key, { tokens, lastRefillMs: t });

    if (buckets.size > SOFT_BUCKET_CAP) {
      const cutoff = t - fullRefillMs;
      for (const [k, v] of buckets) {
        if (v.lastRefillMs < cutoff) buckets.delete(k);
      }
    }

    return { allowed: true, remaining: Math.floor(tokens) };
  };
}

export function getClientIpKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}
