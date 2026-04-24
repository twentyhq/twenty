/**
 * Bounded "have we already failed to load this URL?" cache.
 *
 * The visual scenes (HomeVisual, ThreeCards/FamiliarInterface, …) load
 * remote avatars / favicons on demand. When a URL fails (network error,
 * 404, blocked by CORS, …) we record it so subsequent renders skip the
 * fetch instead of hammering the same broken host. The recording cache
 * needs a cap — without one, a long-running tab that scrolls past many
 * unique failing URLs would grow the set unboundedly.
 *
 * Implementation: FIFO of insertion order, evicting the oldest entry once
 * `maxSize` is reached. A `Set` preserves insertion order in modern JS
 * runtimes (ECMA-262, since ES2015), so we don't need a separate queue —
 * we just `delete` + re-insert on touch (touch is a no-op here; we never
 * "rehit" an entry to bump it, the `has` check is the entire API).
 *
 * `maxSize` is a soft ceiling, not a security boundary. The cap exists to
 * keep memory predictable on long sessions, not to prevent abuse.
 */
export type BoundedFailureCache = {
  has(url: string): boolean;
  add(url: string): void;
};

export function createBoundedFailureCache(
  maxSize: number,
): BoundedFailureCache {
  if (!Number.isInteger(maxSize) || maxSize <= 0) {
    throw new Error(
      `createBoundedFailureCache: maxSize must be a positive integer (got ${maxSize}).`,
    );
  }
  const entries = new Set<string>();
  return {
    has(url) {
      return entries.has(url);
    },
    add(url) {
      if (entries.has(url)) return;
      if (entries.size >= maxSize) {
        const oldest = entries.values().next().value;
        if (oldest !== undefined) entries.delete(oldest);
      }
      entries.add(url);
    },
  };
}
