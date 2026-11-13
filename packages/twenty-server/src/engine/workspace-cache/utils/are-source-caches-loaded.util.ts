import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { type WorkspaceDerivedCacheSourceKeyName } from 'src/engine/workspace-cache/types/workspace-derived-cache-source-key-name.type';

export const areSourceCachesLoaded = <
  TSourceKeyName extends WorkspaceDerivedCacheSourceKeyName,
>(
  cacheData: Partial<WorkspaceCacheDataMap>,
  sourceKeyNames: readonly TSourceKeyName[],
): cacheData is Partial<WorkspaceCacheDataMap> &
  Pick<WorkspaceCacheDataMap, TSourceKeyName> =>
  sourceKeyNames.every((sourceKeyName) => isDefined(cacheData[sourceKeyName]));
