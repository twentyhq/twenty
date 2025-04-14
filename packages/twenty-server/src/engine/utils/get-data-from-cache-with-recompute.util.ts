import { isDefined } from 'twenty-shared/utils';

import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

type CacheResult<T, U> = {
  version: T;
  data: U;
};

const getFromCacheWithRecompute = async <T, U>({
  workspaceId,
  getCacheData,
  getCacheVersion,
  recomputeCache,
  cachedEntityName,
  exceptionCode,
}: {
  workspaceId: string;
  getCacheData: (workspaceId: string) => Promise<U | undefined>;
  getCacheVersion: (workspaceId: string) => Promise<T | undefined>;
  recomputeCache: (params: { workspaceId: string }) => Promise<void>;
  cachedEntityName: string;
  exceptionCode: TwentyORMExceptionCode;
}): Promise<CacheResult<T, U>> => {
  let cachedVersion: T | undefined;
  let cachedData: U | undefined;

  cachedVersion = await getCacheVersion(workspaceId);
  cachedData = await getCacheData(workspaceId);

  if (!isDefined(cachedData) || !isDefined(cachedVersion)) {
    await recomputeCache({ workspaceId });

    cachedData = await getCacheData(workspaceId);
    cachedVersion = await getCacheVersion(workspaceId);

    if (!isDefined(cachedData) || !isDefined(cachedVersion)) {
      throw new TwentyORMException(
        `${cachedEntityName} not found after recompute for workspace ${workspaceId}`,
        exceptionCode,
      );
    }
  }

  return {
    version: cachedVersion,
    data: cachedData,
  };
};

export { CacheResult, getFromCacheWithRecompute };
