import { isDefined } from '@/utils/validation/isDefined';

// Insertion-order LRU and timestamp LRU differ only in where the rank comes
// from, so both go through here rather than each keeping its own eviction loop.
export const evictLeastRecentlyUsed = <TKey, TValue>({
  map,
  maxEntries,
  minEvict = 0,
  recencyOf,
  matches,
}: {
  map: Map<TKey, TValue>;
  maxEntries: number;
  // Evict at least this many once over cap, so a periodic sweep drops a batch
  // instead of trimming one entry per call. Defaults to the exact overflow.
  minEvict?: number;
  // Higher = more recently used. Omit when recency is the map's own insertion
  // order, which readLruEntry and writeLruEntry maintain by re-inserting: with
  // no sort, candidates stay in map order and the oldest are evicted first.
  recencyOf?: (value: TValue) => number;
  // Restricts the cap to a subset: non-matching entries neither count towards
  // maxEntries nor get evicted. Omit to apply to the whole map.
  matches?: (key: TKey) => boolean;
}): number => {
  if (!isDefined(matches)) {
    if (map.size <= maxEntries) {
      return 0;
    }

    if (!isDefined(recencyOf)) {
      const evictCount = Math.min(
        map.size,
        Math.max(minEvict, map.size - maxEntries),
      );
      const keys = map.keys();

      for (let index = 0; index < evictCount; index += 1) {
        const entry = keys.next();

        if (entry.done) {
          break;
        }

        map.delete(entry.value);
      }

      return evictCount;
    }
  }

  const candidates: [TKey, TValue][] = [];

  for (const keyEntry of map) {
    if (!isDefined(matches) || matches(keyEntry[0])) {
      candidates.push(keyEntry);
    }
  }

  if (candidates.length <= maxEntries) {
    return 0;
  }

  if (isDefined(recencyOf)) {
    candidates.sort((a, b) => recencyOf(a[1]) - recencyOf(b[1]));
  }

  const evictCount = Math.min(
    candidates.length,
    Math.max(minEvict, candidates.length - maxEntries),
  );

  for (const [key] of candidates.slice(0, evictCount)) {
    map.delete(key);
  }

  return evictCount;
};
