import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceLocalCacheEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';
import { getKeyNameFromLocalCacheKey } from 'src/engine/workspace-cache/utils/get-key-name-from-local-cache-key.util';

export type PackIdleVersionsResult = {
  packed: number;
  remaining: number;
  // Costliest pack observed in this slice, to budget the next one. Deliberately not
  // an all-time maximum: one pathological version would throttle packing for ever.
  packCostEstimateMs: number;
};

type LiveVersion = { localKey: string; hash: string; lastReadAt: number };

export const packIdleVersions = <T>({
  localCache,
  liveVersionsPerProvider,
  minIdleMs,
  budgetMs,
  packCostEstimateMs = 0,
  pack,
  now = () => performance.now(),
  nowEpochMs = () => Date.now(),
}: {
  localCache: ReadonlyMap<string, WorkspaceLocalCacheEntry<T>>;
  liveVersionsPerProvider: number;
  minIdleMs: number;
  budgetMs: number;
  packCostEstimateMs?: number;
  pack: (params: { localKey: string; data: T }) => Buffer | undefined;
  now?: () => number;
  nowEpochMs?: () => number;
}): PackIdleVersionsResult => {
  const startedAt = now();
  const idleSince = nowEpochMs() - minIdleMs;
  const liveByProvider = new Map<string, LiveVersion[]>();

  for (const [localKey, entry] of localCache) {
    for (const [hash, version] of entry.versions) {
      if (version.state !== 'live') {
        continue;
      }

      const provider = getKeyNameFromLocalCacheKey(localKey);
      const live = liveByProvider.get(provider) ?? [];

      live.push({ localKey, hash, lastReadAt: version.lastReadAt });
      liveByProvider.set(provider, live);
    }
  }

  const candidates: LiveVersion[] = [];

  for (const live of liveByProvider.values()) {
    if (live.length <= liveVersionsPerProvider) {
      continue;
    }

    live.sort((a, b) => a.lastReadAt - b.lastReadAt);

    // Versions read since idleSince still count against the provider's budget —
    // they are just never the ones packed, since packing the working set only
    // buys an unpack on the next read.
    candidates.push(
      ...live
        .slice(0, live.length - liveVersionsPerProvider)
        .filter((version) => version.lastReadAt <= idleSince),
    );
  }

  candidates.sort((a, b) => a.lastReadAt - b.lastReadAt);

  let packed = 0;
  let index = 0;
  let costliestPackMs = 0;

  for (const { localKey, hash } of candidates) {
    // The first version of a slice always runs: one version is indivisible and can
    // cost more than the whole budget on its own, so gating it would stall packing
    // for good. Every version after it is gated on what packing cost last slice,
    // which keeps the overrun to a single version instead of one per candidate.
    if (index > 0 && now() - startedAt + packCostEstimateMs >= budgetMs) {
      break;
    }
    index += 1;

    const entry = localCache.get(localKey);
    const version = entry?.versions.get(hash);

    if (!isDefined(entry) || version?.state !== 'live') {
      continue;
    }

    const packStartedAt = now();
    const blob = pack({ localKey, data: version.data });

    costliestPackMs = Math.max(costliestPackMs, now() - packStartedAt);

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
    remaining: candidates.length - index,
    packCostEstimateMs: costliestPackMs,
  };
};
