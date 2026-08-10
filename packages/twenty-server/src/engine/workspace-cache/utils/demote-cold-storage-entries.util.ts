import { type WorkspaceLocalCacheEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';
import { getProviderFromCacheKey } from 'src/engine/workspace-cache/utils/get-provider-from-cache-key.util';

export const demoteColdStorageEntries = <T, TKeyName>({
  localCache,
  keyNameByEligiblePrefix,
  hotEntriesPerPrefix,
  serialize,
}: {
  localCache: ReadonlyMap<string, WorkspaceLocalCacheEntry<T>>;
  keyNameByEligiblePrefix: ReadonlyMap<string, TKeyName>;
  hotEntriesPerPrefix: number;
  serialize: (params: {
    localKey: string;
    keyName: TKeyName;
    data: T;
  }) => Buffer | undefined;
}): number => {
  const hotByPrefix = new Map<
    string,
    { localKey: string; hash: string; lastReadAt: number }[]
  >();

  for (const [localKey, entry] of localCache) {
    const prefix = getProviderFromCacheKey(localKey);

    if (!keyNameByEligiblePrefix.has(prefix)) {
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

  let demoted = 0;

  for (const [prefix, hot] of hotByPrefix) {
    if (hot.length <= hotEntriesPerPrefix) {
      continue;
    }

    hot.sort((a, b) => a.lastReadAt - b.lastReadAt);

    for (const { localKey, hash } of hot.slice(
      0,
      hot.length - hotEntriesPerPrefix,
    )) {
      const version = localCache.get(localKey)?.versions.get(hash);

      if (version?.state !== 'hot') {
        continue;
      }

      const keyName = keyNameByEligiblePrefix.get(prefix);

      if (keyName === undefined) {
        continue;
      }

      const blob = serialize({ localKey, keyName, data: version.data });

      if (blob === undefined) {
        continue;
      }

      localCache.get(localKey)?.versions.set(hash, {
        state: 'cold',
        blob,
        lastReadAt: version.lastReadAt,
      });
      demoted += 1;
    }
  }

  return demoted;
};
