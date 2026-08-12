import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceLocalCacheEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';

export type PackIdleVersionsResult = {
  packed: number;
  remaining: number;
};

export const packIdleVersions = <T>({
  localCache,
  minIdleMs,
  maxVersionsPerRun,
  pack,
  nowEpochMs = () => Date.now(),
}: {
  localCache: ReadonlyMap<string, WorkspaceLocalCacheEntry<T>>;
  minIdleMs: number;
  maxVersionsPerRun: number;
  pack: (params: { localKey: string; data: T }) => Buffer | undefined;
  nowEpochMs?: () => number;
}): PackIdleVersionsResult => {
  const idleSince = nowEpochMs() - minIdleMs;
  const candidates: { localKey: string; hash: string; lastReadAt: number }[] =
    [];

  for (const [localKey, entry] of localCache) {
    for (const [hash, version] of entry.versions) {
      if (version.state === 'live' && version.lastReadAt <= idleSince) {
        candidates.push({ localKey, hash, lastReadAt: version.lastReadAt });
      }
    }
  }

  candidates.sort((a, b) => a.lastReadAt - b.lastReadAt);

  let packed = 0;

  for (const { localKey, hash } of candidates.slice(0, maxVersionsPerRun)) {
    const entry = localCache.get(localKey);
    const version = entry?.versions.get(hash);

    if (!isDefined(entry) || version?.state !== 'live') {
      continue;
    }

    const blob = pack({ localKey, data: version.data });

    if (!isDefined(blob)) {
      continue;
    }

    entry.versions.set(hash, {
      state: 'packed',
      blob,
      lastReadAt: version.lastReadAt,
    });
    packed += 1;
  }

  return {
    packed,
    remaining: Math.max(candidates.length - maxVersionsPerRun, 0),
  };
};
