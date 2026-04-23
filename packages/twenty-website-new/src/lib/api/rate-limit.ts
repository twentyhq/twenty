/**
 * `createRateLimiter`
 *
 * In-memory token-bucket rate limiter. Designed for low-volume public POST
 * endpoints (the partner application form, contact-cal proxy, …) as a first
 * line of defence against accidental floods and unsophisticated abuse.
 *
 * Honest scope:
 * - State lives in module memory of the running process. On serverless
 *   platforms (Vercel, AWS Lambda, …) each warm instance has its own
 *   bucket map. Limits therefore apply *per instance, per cold-start
 *   lifetime* — not globally across the fleet. A determined attacker can
 *   still cause N × `capacity` requests through by hitting N instances in
 *   parallel.
 * - For real, fleet-wide rate limits, swap the storage backend for a
 *   shared KV (Upstash, Redis, Vercel KV). The shape of `check(key)` is
 *   intentionally compatible with a `Promise<RateLimitResult>` swap-in.
 * - The map self-evicts opportunistically once it grows past a soft cap,
 *   so it cannot leak unboundedly across a long-running instance.
 *
 * Algorithm: classic token bucket. A bucket holds up to `capacity` tokens
 * and refills at `refillPerSec` tokens/second. Each request costs 1 token.
 * Empty bucket → request denied with a `retryAfterMs` hint suitable for
 * the HTTP `Retry-After` header.
 *
 * `now()` is injectable for deterministic tests.
 */

export type RateLimitOptions = {
  /** Maximum tokens the bucket can hold (also the burst size). */
  capacity: number;
  /** Tokens added per real-time second. */
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

/**
 * Best-effort client-IP extraction for rate-limit keys. Trusts the first
 * value in `x-forwarded-for` (Vercel, Cloudflare, and most reverse proxies
 * prepend the real client IP), then falls back to `x-real-ip`, then to a
 * literal `'unknown'` so unkeyed traffic still funnels into one bucket
 * rather than bypassing the limit.
 *
 * This is *not* a security boundary — clients can spoof these headers if no
 * proxy is in front. It is a key-derivation helper. Pair it with a real
 * proxy/CDN that strips and re-sets these headers in production.
 */
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
