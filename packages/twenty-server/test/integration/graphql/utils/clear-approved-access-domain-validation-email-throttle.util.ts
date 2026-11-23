import { buildApprovedAccessDomainValidationEmailThrottleKey } from 'src/engine/core-modules/approved-access-domain/utils/build-approved-access-domain-validation-email-throttle-key.util';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TOKEN_BUCKET_THROTTLE_KEY_PREFIX } from 'src/engine/core-modules/throttler/constants/token-bucket-throttle-key-prefix.constant';

export const clearApprovedAccessDomainValidationEmailThrottle = (
  workspaceId: string,
) => {
  const cacheStorage = global.app.get<CacheStorageService>(
    CacheStorageNamespace.EngineWorkspace,
    { strict: false },
  );

  return cacheStorage.del(
    `${TOKEN_BUCKET_THROTTLE_KEY_PREFIX}:${buildApprovedAccessDomainValidationEmailThrottleKey(workspaceId)}`,
  );
};
