import { type VersionEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';
import { getKeyNameFromLocalCacheKey } from 'src/engine/workspace-cache/utils/get-key-name-from-local-cache-key.util';

export type LocalCacheStats = {
  entries: number;
  workspaces: number;
  versionsTotal: number;
  versionsByCount: Record<string, number>;
  entriesByKeyName: Record<string, number>;
  liveVersionsByKeyName: Record<string, number>;
  packedVersionsByKeyName: Record<string, number>;
  packedBytesByKeyName: Record<string, number>;
  liveVersionsTotal: number;
  packedVersionsTotal: number;
  packedBytesTotal: number;
};

type StatsInput = ReadonlyMap<
  string,
  { versions: ReadonlyMap<string, VersionEntry<unknown>> }
>;

export const computeLocalCacheStats = (
  localCache: StatsInput,
): LocalCacheStats => {
  const workspaceIds = new Set<string>();
  const versionsByCount: Record<string, number> = {
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5+': 0,
  };
  const entriesByKeyName: Record<string, number> = {};
  const liveVersionsByKeyName: Record<string, number> = {};
  const packedVersionsByKeyName: Record<string, number> = {};
  const packedBytesByKeyName: Record<string, number> = {};
  let versionsTotal = 0;
  let liveVersionsTotal = 0;
  let packedVersionsTotal = 0;
  let packedBytesTotal = 0;

  for (const [key, entry] of localCache) {
    workspaceIds.add(key.slice(key.lastIndexOf(':') + 1));
    const keyName = getKeyNameFromLocalCacheKey(key);

    entriesByKeyName[keyName] = (entriesByKeyName[keyName] ?? 0) + 1;
    liveVersionsByKeyName[keyName] ??= 0;
    packedVersionsByKeyName[keyName] ??= 0;
    packedBytesByKeyName[keyName] ??= 0;

    const versionCount = entry.versions.size;

    versionsTotal += versionCount;
    const bucket = versionCount >= 5 ? '5+' : String(versionCount);

    versionsByCount[bucket] = (versionsByCount[bucket] ?? 0) + 1;

    for (const version of entry.versions.values()) {
      if (version.state === 'packed') {
        packedVersionsByKeyName[keyName] += 1;
        packedVersionsTotal += 1;
        packedBytesByKeyName[keyName] += version.blob.byteLength;
        packedBytesTotal += version.blob.byteLength;
        continue;
      }

      liveVersionsByKeyName[keyName] += 1;
      liveVersionsTotal += 1;
    }
  }

  return {
    entries: localCache.size,
    workspaces: workspaceIds.size,
    versionsTotal,
    versionsByCount,
    entriesByKeyName,
    liveVersionsByKeyName,
    packedVersionsByKeyName,
    packedBytesByKeyName,
    liveVersionsTotal,
    packedVersionsTotal,
    packedBytesTotal,
  };
};
