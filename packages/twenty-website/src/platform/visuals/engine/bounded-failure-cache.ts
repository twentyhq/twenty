export type BoundedFailureCache = {
  has: (url: string) => boolean;
  add: (url: string) => void;
};

// Remembers failed asset URLs so loaders stop retrying them, with FIFO
// eviction so an attacker-controlled URL stream cannot grow memory.
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
      if (entries.has(url)) {
        return;
      }
      if (entries.size >= maxSize) {
        const oldest = entries.values().next().value;
        if (oldest !== undefined) {
          entries.delete(oldest);
        }
      }
      entries.add(url);
    },
  };
}
