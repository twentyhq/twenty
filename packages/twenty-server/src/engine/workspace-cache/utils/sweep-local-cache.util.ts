import { type WorkspaceLocalCacheEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';
import { evictLeastRecentlyUsed } from 'src/utils/lru-map.util';

export type LocalCacheSweepConfig = {
  ttlMs: number;
  maxEntriesByKeyName: ReadonlyMap<string, number>;
  globalMaxEntries: number;
  minEvict: number;
};

const lastReadAtOf = <T>(entry: WorkspaceLocalCacheEntry<T>): number =>
  entry.versions.get(entry.latestHash)?.lastReadAt ?? 0;

// Mutates the cache: expire versions idle past the TTL (dropping any entry left without a current
// version), then trim each capped provider and the global total to budget by least-recently-read.
// Returns the number of entries evicted.
export const sweepLocalCache = <T>(
  localCache: Map<string, WorkspaceLocalCacheEntry<T>>,
  now: number,
  config: LocalCacheSweepConfig,
): number => {
  let evicted = 0;

  for (const [localKey, entry] of localCache) {
    for (const [hash, version] of entry.versions) {
      if (now - version.lastReadAt > config.ttlMs) {
        entry.versions.delete(hash);
      }
    }

    if (entry.versions.size === 0 || !entry.versions.has(entry.latestHash)) {
      localCache.delete(localKey);
      evicted += 1;
    }
  }

  for (const [keyName, maxEntries] of config.maxEntriesByKeyName) {
    evicted += evictLeastRecentlyUsed({
      map: localCache,
      maxEntries,
      recencyOf: lastReadAtOf,
      matches: (key) => key.startsWith(`${keyName}:`),
    });
  }

  return (
    evicted +
    evictLeastRecentlyUsed({
      map: localCache,
      maxEntries: config.globalMaxEntries,
      minEvict: config.minEvict,
      recencyOf: lastReadAtOf,
    })
  );
};
