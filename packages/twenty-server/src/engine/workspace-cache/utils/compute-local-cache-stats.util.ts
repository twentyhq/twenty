import { getKeyNameFromLocalCacheKey } from 'src/engine/workspace-cache/utils/get-key-name-from-local-cache-key.util';

export type LocalCacheStats = {
  entries: number;
  workspaces: number;
  versionsTotal: number;
  versionsByCount: Record<string, number>;
  entriesByKeyName: Record<string, number>;
};

export const computeLocalCacheStats = (
  localCache: ReadonlyMap<string, { versions: { size: number } }>,
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
  let versionsTotal = 0;

  for (const [key, entry] of localCache) {
    workspaceIds.add(key.slice(key.lastIndexOf(':') + 1));
    const keyName = getKeyNameFromLocalCacheKey(key);

    entriesByKeyName[keyName] = (entriesByKeyName[keyName] ?? 0) + 1;
    const versionCount = entry.versions.size;

    versionsTotal += versionCount;
    const bucket = versionCount >= 5 ? '5+' : String(versionCount);

    versionsByCount[bucket] = (versionsByCount[bucket] ?? 0) + 1;
  }

  return {
    entries: localCache.size,
    workspaces: workspaceIds.size,
    versionsTotal,
    versionsByCount,
    entriesByKeyName,
  };
};
