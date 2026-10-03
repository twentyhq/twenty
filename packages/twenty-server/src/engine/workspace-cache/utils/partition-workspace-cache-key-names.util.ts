import {
  type WorkspaceCacheKeyName,
  type WorkspaceCacheReadableKeyName,
  type WorkspaceDerivedCacheKeyName,
} from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { isWorkspaceDerivedCacheKeyName } from 'src/engine/workspace-cache/utils/is-workspace-derived-cache-key-name.util';

export const partitionWorkspaceCacheKeyNames = ({
  cacheKeyNames,
  getSourceKeyNames,
}: {
  cacheKeyNames: readonly WorkspaceCacheReadableKeyName[];
  getSourceKeyNames: (
    derivedKeyName: WorkspaceDerivedCacheKeyName,
  ) => readonly WorkspaceCacheKeyName[];
}): {
  providerKeyNames: WorkspaceCacheKeyName[];
  derivedKeyNames: WorkspaceDerivedCacheKeyName[];
  providerKeyNamesToLoad: WorkspaceCacheKeyName[];
} => {
  const providerKeyNames: WorkspaceCacheKeyName[] = [];
  const derivedKeyNames: WorkspaceDerivedCacheKeyName[] = [];

  for (const cacheKeyName of new Set(cacheKeyNames)) {
    if (isWorkspaceDerivedCacheKeyName(cacheKeyName)) {
      derivedKeyNames.push(cacheKeyName);
    } else {
      providerKeyNames.push(cacheKeyName);
    }
  }

  const providerKeyNamesToLoad = [
    ...new Set([
      ...providerKeyNames,
      ...derivedKeyNames.flatMap(getSourceKeyNames),
    ]),
  ];

  return { providerKeyNames, derivedKeyNames, providerKeyNamesToLoad };
};
