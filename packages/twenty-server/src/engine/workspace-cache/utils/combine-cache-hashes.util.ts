import { createHash } from 'crypto';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export const combineCacheHashes = (
  hashes: Partial<Record<WorkspaceCacheKeyName, string>>,
  cacheKeyNames: readonly WorkspaceCacheKeyName[],
): string => {
  const orderedHashes = cacheKeyNames.map((cacheKeyName) => {
    const hash = hashes[cacheKeyName];

    if (!isDefined(hash)) {
      throw new Error(`Missing cache hash for "${cacheKeyName}"`);
    }

    return hash;
  });

  return createHash('sha256').update(orderedHashes.join(':')).digest('hex');
};
