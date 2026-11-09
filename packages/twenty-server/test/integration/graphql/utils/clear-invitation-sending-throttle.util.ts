import IORedis from 'ioredis';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TOKEN_BUCKET_THROTTLE_KEY_PREFIX } from 'src/engine/core-modules/throttler/constants/token-bucket-throttle-key-prefix.constant';

// An email can be invited 10 times a week, which repeated local runs use up
export const clearInvitationSendingThrottle = async ({
  email,
}: {
  email: string;
}) => {
  const redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379');

  try {
    await redis.del(
      `${CacheStorageNamespace.IntegrationTests}:${CacheStorageNamespace.EngineWorkspace}:${TOKEN_BUCKET_THROTTLE_KEY_PREFIX}:invitation-resending-workspace:throttler:${email}`,
    );
  } finally {
    redis.disconnect();
  }
};
