import { type WorkspaceLocalCacheEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';

export type ColdStorageDemotion = {
  localKey: string;
  hash: string;
};

export type ColdStorageConfig = {
  // Cache-key prefixes eligible for cold storage. Only providers whose payloads are already
  // JSON round-tripped for Redis qualify; the ORM entity metadata graph holds class instances,
  // functions and cycles, so it can never be one of these.
  eligiblePrefixes: ReadonlySet<string>;
  hotEntriesPerPrefix: number;
};

const prefixOf = (localKey: string): string =>
  localKey.slice(0, localKey.lastIndexOf(':'));

// Picks the versions to serialize, keeping the `hotEntriesPerPrefix` most recently read entries
// of each eligible provider as live objects. Pure so the ranking is unit-testable; the caller
// owns the encoding, which needs the provider.
export const selectColdStorageDemotions = <T>(
  localCache: ReadonlyMap<string, WorkspaceLocalCacheEntry<T>>,
  config: ColdStorageConfig,
): ColdStorageDemotion[] => {
  const hotByPrefix = new Map<
    string,
    { localKey: string; hash: string; lastReadAt: number }[]
  >();

  for (const [localKey, entry] of localCache) {
    const prefix = prefixOf(localKey);

    if (!config.eligiblePrefixes.has(prefix)) {
      continue;
    }

    for (const [hash, version] of entry.versions) {
      if (version.state !== 'hot') {
        continue;
      }

      const hot = hotByPrefix.get(prefix) ?? [];

      hot.push({ localKey, hash, lastReadAt: version.lastReadAt });
      hotByPrefix.set(prefix, hot);
    }
  }

  const demotions: ColdStorageDemotion[] = [];

  for (const hot of hotByPrefix.values()) {
    if (hot.length <= config.hotEntriesPerPrefix) {
      continue;
    }

    hot.sort((a, b) => a.lastReadAt - b.lastReadAt);

    for (const candidate of hot.slice(
      0,
      hot.length - config.hotEntriesPerPrefix,
    )) {
      demotions.push({ localKey: candidate.localKey, hash: candidate.hash });
    }
  }

  return demotions;
};
