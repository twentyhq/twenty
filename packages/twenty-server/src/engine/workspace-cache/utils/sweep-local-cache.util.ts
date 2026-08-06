import { type WorkspaceLocalCacheEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';

export type LocalCacheSweepConfig = {
  ttlMs: number;
  maxEntriesByPrefix: ReadonlyMap<string, number>;
  globalMaxEntries: number;
  minEvict: number;
};

const lastReadAtOf = <T>(entry: WorkspaceLocalCacheEntry<T>): number =>
  entry.versions.get(entry.latestHash)?.lastReadAt ?? 0;

const evictLeastRecentlyRead = <T>({
  localCache,
  matches,
  maxEntries,
  minEvict,
}: {
  localCache: Map<string, WorkspaceLocalCacheEntry<T>>;
  matches: (key: string) => boolean;
  maxEntries: number;
  minEvict: number;
}): number => {
  const matching: [string, WorkspaceLocalCacheEntry<T>][] = [];

  for (const keyEntry of localCache) {
    if (matches(keyEntry[0])) {
      matching.push(keyEntry);
    }
  }

  if (matching.length <= maxEntries) {
    return 0;
  }

  matching.sort((a, b) => lastReadAtOf(a[1]) - lastReadAtOf(b[1]));

  const evictCount = Math.min(
    matching.length,
    Math.max(minEvict, matching.length - maxEntries),
  );

  for (let index = 0; index < evictCount; index += 1) {
    localCache.delete(matching[index][0]);
  }

  return evictCount;
};

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

  for (const [prefix, maxEntries] of config.maxEntriesByPrefix) {
    evicted += evictLeastRecentlyRead({
      localCache,
      matches: (key) => key.startsWith(`${prefix}:`),
      maxEntries,
      minEvict: 0,
    });
  }

  evicted += evictLeastRecentlyRead({
    localCache,
    matches: () => true,
    maxEntries: config.globalMaxEntries,
    minEvict: config.minEvict,
  });

  return evicted;
};
