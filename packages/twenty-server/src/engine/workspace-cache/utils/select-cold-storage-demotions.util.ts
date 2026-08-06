import { type WorkspaceLocalCacheEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';

export type ColdStorageDemotion = {
  localKey: string;
  hash: string;
};

export type ColdStorageConfig = {
  eligiblePrefixes: ReadonlySet<string>;
  hotEntriesPerPrefix: number;
};

const prefixOf = (localKey: string): string =>
  localKey.slice(0, localKey.lastIndexOf(':'));
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
