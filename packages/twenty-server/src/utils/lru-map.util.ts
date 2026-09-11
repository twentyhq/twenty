import { isDefined } from 'twenty-shared/utils';

export const readLruEntry = <Key, Value>({
  map,
  key,
}: {
  map: Map<Key, Value>;
  key: Key;
}): Value | undefined => {
  const value = map.get(key);

  if (value === undefined) {
    return undefined;
  }

  map.delete(key);
  map.set(key, value);

  return value;
};

// Insertion-order LRU and timestamp LRU differ only in where the rank comes
// from, so both go through here rather than each keeping its own eviction loop.
export const evictLeastRecentlyUsed = <Key, Value>({
  map,
  maxEntries,
  minEvict = 0,
  recencyOf,
  matches,
}: {
  map: Map<Key, Value>;
  maxEntries: number;
  // Evict at least this many once over cap, so a periodic sweep drops a batch
  // instead of trimming one entry per call. Defaults to the exact overflow.
  minEvict?: number;
  // Higher = more recently used. Omit when recency is the map's own insertion
  // order, which readLruEntry and writeLruEntry maintain by re-inserting: with
  // no sort, candidates stay in map order and the oldest are evicted first.
  recencyOf?: (value: Value) => number;
  // Restricts the cap to a subset: non-matching entries neither count towards
  // maxEntries nor get evicted. Omit to apply to the whole map.
  matches?: (key: Key) => boolean;
}): number => {
  const candidates: [Key, Value][] = [];

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

  for (let index = 0; index < evictCount; index += 1) {
    map.delete(candidates[index][0]);
  }

  return evictCount;
};

export const writeLruEntry = <Key, Value>({
  map,
  key,
  value,
  maxEntries,
}: {
  map: Map<Key, Value>;
  key: Key;
  value: Value;
  maxEntries: number;
}): void => {
  map.delete(key);
  map.set(key, value);

  evictLeastRecentlyUsed({ map, maxEntries });
};
