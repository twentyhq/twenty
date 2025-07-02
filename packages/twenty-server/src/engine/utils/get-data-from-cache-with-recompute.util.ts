import { Logger } from '@nestjs/common';

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
  logger,
}: {
  workspaceId: string;
  getCacheData: (workspaceId: string) => Promise<U | undefined>;
  getCacheVersion?: (workspaceId: string) => Promise<T | undefined>;
  recomputeCache: (params: { workspaceId: string }) => Promise<void>;
  cachedEntityName: string;
  exceptionCode: TwentyORMExceptionCode;
  logger: Logger;
}): Promise<CacheResult<T, U>> => {
  let cachedVersion: T | undefined;
  let cachedData: U | undefined;

  const expectCacheVersion = isDefined(getCacheVersion);

  if (expectCacheVersion) {
    cachedVersion = await getCacheVersion(workspaceId);
  }

  cachedData = await getCacheData(workspaceId);

  if (
    !isDefined(cachedData) ||
    (expectCacheVersion && !isDefined(cachedVersion))
  ) {
    logger.warn(
      `Triggering cache recompute for ${cachedEntityName} (workspace ${workspaceId})`,
      {
        cachedVersion,
        cachedData,
      },
    );
    await recomputeCache({ workspaceId });

    cachedData = await getCacheData(workspaceId);
    if (expectCacheVersion) {
      cachedVersion = await getCacheVersion(workspaceId);
    }

    if (
      !isDefined(cachedData) ||
      (expectCacheVersion && !isDefined(cachedVersion))
    ) {
      logger.warn(
        `Data still missing after recompute for ${cachedEntityName} (workspace ${workspaceId})`,
        {
          cachedVersion,
          cachedData,
        },
      );
      throw new TwentyORMException(
        `${cachedEntityName} not found after recompute for workspace ${workspaceId} (missingData: ${!isDefined(cachedData)}, missingVersion: ${expectCacheVersion && !isDefined(cachedVersion)})`,
        exceptionCode,
      );
    }
  }

  return {
    version: cachedVersion as T,
    data: cachedData,
  };
};

export { CacheResult, getFromCacheWithRecompute };
