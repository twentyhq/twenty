import { type WorkspaceLocalCacheEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';
import { getKeyNameFromLocalCacheKey } from 'src/engine/workspace-cache/utils/get-key-name-from-local-cache-key.util';

export const demoteColdStorageEntries = <T>({
  localCache,
  hotEntriesPerProvider,
  serialize,
}: {
  localCache: ReadonlyMap<string, WorkspaceLocalCacheEntry<T>>;
  hotEntriesPerProvider: number;
  serialize: (params: { localKey: string; data: T }) => Buffer | undefined;
}): number => {
  const hotByProvider = new Map<
    string,
    { localKey: string; hash: string; lastReadAt: number }[]
  >();

  for (const [localKey, entry] of localCache) {
    for (const [hash, version] of entry.versions) {
      if (version.state !== 'hot') {
        continue;
      }

      const provider = getKeyNameFromLocalCacheKey(localKey);
      const hot = hotByProvider.get(provider) ?? [];

      hot.push({ localKey, hash, lastReadAt: version.lastReadAt });
      hotByProvider.set(provider, hot);
    }
  }

  let demoted = 0;

  for (const hot of hotByProvider.values()) {
    if (hot.length <= hotEntriesPerProvider) {
      continue;
    }

    hot.sort((a, b) => a.lastReadAt - b.lastReadAt);

    for (const { localKey, hash } of hot.slice(
      0,
      hot.length - hotEntriesPerProvider,
    )) {
      const entry = localCache.get(localKey);
      const version = entry?.versions.get(hash);

      if (!entry || version?.state !== 'hot') {
        continue;
      }

      const blob = serialize({ localKey, data: version.data });

      if (blob === undefined) {
        continue;
      }

      entry.versions.set(hash, {
        state: 'cold',
        blob,
        lastReadAt: version.lastReadAt,
      });
      demoted += 1;
    }
  }

  return demoted;
};
