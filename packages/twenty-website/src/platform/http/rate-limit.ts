// A token-bucket rate limiter for API route handlers: each key (typically a
// client IP) gets `capacity` tokens that refill at `refillPerSec`. The clock is
// injectable so tests drive it deterministically. State is in-memory and
// per-process — adequate for a single Next runtime; a distributed deployment
// would swap the store, not the shape.
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

// Evict idle buckets once the map grows past this, so a flood of unique keys
// cannot leak memory unboundedly.
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
    const nowMs = now();

    let tokens: number;
    const existing = buckets.get(key);
    if (existing == null) {
      tokens = options.capacity;
    } else {
      const elapsedSec = Math.max(0, (nowMs - existing.lastRefillMs) / 1000);
      tokens = Math.min(
        options.capacity,
        existing.tokens + elapsedSec * options.refillPerSec,
      );
    }

    if (tokens < 1) {
      const deficit = 1 - tokens;
      const retryAfterMs = Math.ceil((deficit / options.refillPerSec) * 1000);
      buckets.set(key, { tokens, lastRefillMs: nowMs });
      return { allowed: false, retryAfterMs };
    }

    tokens -= 1;
    buckets.set(key, { tokens, lastRefillMs: nowMs });

    if (buckets.size > SOFT_BUCKET_CAP) {
      const cutoff = nowMs - fullRefillMs;
      for (const [bucketKey, bucket] of buckets) {
        if (bucket.lastRefillMs < cutoff) buckets.delete(bucketKey);
      }
    }

    return { allowed: true, remaining: Math.floor(tokens) };
  };
}
