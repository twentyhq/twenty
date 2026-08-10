import { type WorkspaceLocalCacheEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';
import { getKeyNameFromLocalCacheKey } from 'src/engine/workspace-cache/utils/get-key-name-from-local-cache-key.util';

export type DemoteColdStorageResult = {
  demoted: number;
  remaining: number;
};

export const demoteColdStorageEntries = <T>({
  localCache,
  hotEntriesPerProvider,
  budgetMs,
  serialize,
  now = () => performance.now(),
}: {
  localCache: ReadonlyMap<string, WorkspaceLocalCacheEntry<T>>;
  hotEntriesPerProvider: number;
  budgetMs: number;
  serialize: (params: { localKey: string; data: T }) => Buffer | undefined;
  now?: () => number;
}): DemoteColdStorageResult => {
  // Started before the scan, not after: on a full pod the scan and sort are
  // themselves part of the slice's cost to the event loop.
  const startedAt = now();
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

  const candidates: { localKey: string; hash: string; lastReadAt: number }[] =
    [];

  for (const hot of hotByProvider.values()) {
    if (hot.length <= hotEntriesPerProvider) {
      continue;
    }

    hot.sort((a, b) => a.lastReadAt - b.lastReadAt);
    candidates.push(...hot.slice(0, hot.length - hotEntriesPerProvider));
  }

  // Coldest first across every provider, so a slice that runs out of budget
  // leaves behind the entries most likely to be read again anyway, and the next
  // slice re-selects the same remaining ones. No cursor to keep in sync.
  candidates.sort((a, b) => a.lastReadAt - b.lastReadAt);

  let demoted = 0;
  let index = 0;

  for (const { localKey, hash } of candidates) {
    // Checked between entries, so one slice can overrun by a single entry.
    if (now() - startedAt >= budgetMs) {
      break;
    }
    index += 1;

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

  return { demoted, remaining: candidates.length - index };
};
