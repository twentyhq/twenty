import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TOKEN_BUCKET_THROTTLE_KEY_PREFIX } from 'src/engine/core-modules/throttler/constants/token-bucket-throttle-key-prefix.constant';
import { buildInvitationSendingThrottleKey } from 'src/engine/core-modules/workspace-invitation/utils/build-invitation-sending-throttle-key.util';

// An email can be invited 10 times a week, which repeated local runs use up
export const clearInvitationSendingThrottle = ({ email }: { email: string }) =>
  global.app
    .get<CacheStorageService>(CacheStorageNamespace.EngineWorkspace, {
      strict: false,
    })
    .del(
      `${TOKEN_BUCKET_THROTTLE_KEY_PREFIX}:${buildInvitationSendingThrottleKey(email)}`,
    );
