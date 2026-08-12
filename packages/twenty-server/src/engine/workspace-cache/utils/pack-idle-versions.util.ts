import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceLocalCacheEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';

export type PackIdleVersionsResult = {
  packed: number;
  pending: number;
};

export const packIdleVersions = <T>({
  localCache,
  minIdleMs,
  ponderationBudget,
  ponderationOf,
  isPackable,
  pack,
  nowEpochMs = () => Date.now(),
}: {
  localCache: ReadonlyMap<string, WorkspaceLocalCacheEntry<T>>;
  minIdleMs: number;
  ponderationBudget: number;
  ponderationOf: (localKey: string) => number;
  isPackable: (localKey: string) => boolean;
  pack: (params: { localKey: string; data: T }) => Buffer | undefined;
  nowEpochMs?: () => number;
}): PackIdleVersionsResult => {
  const idleSince = nowEpochMs() - minIdleMs;
  const candidates: {
    localKey: string;
    hash: string;
    lastReadAt: number;
    ponderation: number;
  }[] = [];

  for (const [localKey, entry] of localCache) {
    if (!isPackable(localKey)) {
      continue;
    }

    const ponderation = ponderationOf(localKey);

    if (ponderation > ponderationBudget) {
      continue;
    }

    for (const [hash, version] of entry.versions) {
      if (version.state === 'live' && version.lastReadAt <= idleSince) {
        candidates.push({
          localKey,
          hash,
          lastReadAt: version.lastReadAt,
          ponderation,
        });
      }
    }
  }

  candidates.sort((a, b) => a.lastReadAt - b.lastReadAt);

  let packed = 0;
  let spentPonderation = 0;

  for (const { localKey, hash, ponderation } of candidates) {
    if (spentPonderation >= ponderationBudget) {
      break;
    }

    if (spentPonderation + ponderation > ponderationBudget) {
      continue;
    }

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
    spentPonderation += ponderation;
  }

  return {
    packed,
    pending: candidates.length - packed,
  };
};
