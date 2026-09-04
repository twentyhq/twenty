export function memoizeWithExpiry<T>(fn: () => T, ttlMs: number): () => T {
  let cache: { val: T; exp: number } | null = null;
  return () => {
    const now = Date.now();
    if (cache && cache.exp > now) return cache.val;
    const val = fn(); cache = { val, exp: now + ttlMs }; return val;
  };
}