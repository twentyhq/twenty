import IORedis from 'ioredis';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

const CACHED_LAMBDA_FUNCTION_KEY_PATTERN = `${CacheStorageNamespace.IntegrationTests}:${CacheStorageNamespace.ModuleApplications}:lambda-function:*`;

export const clearCachedLambdaFunctions = async (): Promise<void> => {
  const redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379');

  try {
    const keys = await redis.keys(CACHED_LAMBDA_FUNCTION_KEY_PATTERN);

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } finally {
    redis.disconnect();
  }
};
