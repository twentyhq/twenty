import { type WorkspaceLocalCacheEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';

export const demoteColdStorageEntries = <T, TKeyName>({
  localCache,
  hotEntriesPerKeyName,
  serialize,
}: {
  localCache: ReadonlyMap<string, WorkspaceLocalCacheEntry<T, TKeyName>>;
  hotEntriesPerKeyName: number;
  serialize: (params: {
    localKey: string;
    keyName: TKeyName;
    data: T;
  }) => Buffer | undefined;
}): number => {
  const hotByKeyName = new Map<
    TKeyName,
    { localKey: string; hash: string; lastReadAt: number }[]
  >();

  for (const [localKey, entry] of localCache) {
    for (const [hash, version] of entry.versions) {
      if (version.state !== 'hot') {
        continue;
      }

      const hot = hotByKeyName.get(entry.keyName) ?? [];

      hot.push({ localKey, hash, lastReadAt: version.lastReadAt });
      hotByKeyName.set(entry.keyName, hot);
    }
  }

  let demoted = 0;

  for (const hot of hotByKeyName.values()) {
    if (hot.length <= hotEntriesPerKeyName) {
      continue;
    }

    hot.sort((a, b) => a.lastReadAt - b.lastReadAt);

    for (const { localKey, hash } of hot.slice(
      0,
      hot.length - hotEntriesPerKeyName,
    )) {
      const entry = localCache.get(localKey);
      const version = entry?.versions.get(hash);

      if (!entry || version?.state !== 'hot') {
        continue;
      }

      const blob = serialize({
        localKey,
        keyName: entry.keyName,
        data: version.data,
      });

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
