import { isDefined } from 'twenty-shared/utils';

import {
  WorkspaceCacheException,
  WorkspaceCacheExceptionCode,
} from 'src/engine/workspace-cache/exceptions/workspace-cache.exception';
import {
  type WorkspaceCacheDataMap,
  type WorkspaceCacheKeyName,
} from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export const assertWorkspaceCacheSourcesAreLoaded: <
  TSourceKeyName extends WorkspaceCacheKeyName,
>(
  data: Partial<WorkspaceCacheDataMap>,
  sourceKeyNames: readonly TSourceKeyName[],
) => asserts data is Partial<WorkspaceCacheDataMap> &
  Pick<WorkspaceCacheDataMap, TSourceKeyName> = (data, sourceKeyNames) => {
  const missingSourceKeyNames = sourceKeyNames.filter(
    (sourceKeyName) => !isDefined(data[sourceKeyName]),
  );

  if (missingSourceKeyNames.length > 0) {
    throw new WorkspaceCacheException(
      `Missing source cache entries: ${missingSourceKeyNames.join(', ')}`,
      WorkspaceCacheExceptionCode.INTERNAL_SERVER_ERROR,
    );
  }
};
