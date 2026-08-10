import { type VersionEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';
import { getKeyNameFromLocalCacheKey } from 'src/engine/workspace-cache/utils/get-key-name-from-local-cache-key.util';

export type LocalCacheStats = {
  entries: number;
  workspaces: number;
  versionsTotal: number;
  versionsByCount: Record<string, number>;
  entriesByKeyName: Record<string, number>;
  hotVersionsByKeyName: Record<string, number>;
  coldVersionsByKeyName: Record<string, number>;
  coldBytesByKeyName: Record<string, number>;
  hotVersionsTotal: number;
  coldVersionsTotal: number;
  coldBytesTotal: number;
};

type StatsInput = ReadonlyMap<
  string,
  { versions: ReadonlyMap<string, VersionEntry<unknown>> }
>;

export const computeLocalCacheStats = (localCache: StatsInput): LocalCacheStats => {
  const workspaceIds = new Set<string>();
  const versionsByCount: Record<string, number> = {
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5+': 0,
  };
  const entriesByKeyName: Record<string, number> = {};
  const hotVersionsByKeyName: Record<string, number> = {};
  const coldVersionsByKeyName: Record<string, number> = {};
  const coldBytesByKeyName: Record<string, number> = {};
  let versionsTotal = 0;
  let hotVersionsTotal = 0;
  let coldVersionsTotal = 0;
  let coldBytesTotal = 0;

  for (const [key, entry] of localCache) {
    workspaceIds.add(key.slice(key.lastIndexOf(':') + 1));
    const keyName = getKeyNameFromLocalCacheKey(key);

    entriesByKeyName[keyName] = (entriesByKeyName[keyName] ?? 0) + 1;
    hotVersionsByKeyName[keyName] ??= 0;
    coldVersionsByKeyName[keyName] ??= 0;
    coldBytesByKeyName[keyName] ??= 0;

    const versionCount = entry.versions.size;

    versionsTotal += versionCount;
    const bucket = versionCount >= 5 ? '5+' : String(versionCount);

    versionsByCount[bucket] = (versionsByCount[bucket] ?? 0) + 1;

    for (const version of entry.versions.values()) {
      if (version.state === 'cold') {
        coldVersionsByKeyName[keyName] += 1;
        coldVersionsTotal += 1;
        // Exact, unlike the sampled deep-size estimate for hot entries.
        coldBytesByKeyName[keyName] += version.blob.byteLength;
        coldBytesTotal += version.blob.byteLength;
        continue;
      }

      hotVersionsByKeyName[keyName] += 1;
      hotVersionsTotal += 1;
    }
  }

  return {
    entries: localCache.size,
    workspaces: workspaceIds.size,
    versionsTotal,
    versionsByCount,
    entriesByKeyName,
    hotVersionsByKeyName,
    coldVersionsByKeyName,
    coldBytesByKeyName,
    hotVersionsTotal,
    coldVersionsTotal,
    coldBytesTotal,
  };
};
