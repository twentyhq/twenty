import { evictLeastRecentlyUsed } from '@/utils/cache/evictLeastRecentlyUsed';

export const writeLruEntry = <TKey, TValue>({
  map,
  key,
  value,
  maxEntries,
}: {
  map: Map<TKey, TValue>;
  key: TKey;
  value: TValue;
  maxEntries: number;
}): void => {
  map.delete(key);
  map.set(key, value);

  evictLeastRecentlyUsed({ map, maxEntries });
};
