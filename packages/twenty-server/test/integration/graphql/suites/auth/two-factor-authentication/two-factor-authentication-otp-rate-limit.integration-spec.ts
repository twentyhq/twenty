import IORedis from 'ioredis';
import { verifyTwoFactorAuthenticationMethod } from 'test/integration/graphql/utils/verify-two-factor-authentication-method.util';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TWO_FACTOR_AUTHENTICATION_OTP_RATE_LIMIT_MAX } from 'src/engine/core-modules/two-factor-authentication/constants/two-factor-authentication-otp-rate-limit.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

// Phil has no two-factor method and no other suite verifies codes for him, so
// spending his whole bucket cannot interfere with the TOTP window tests.
const RATE_LIMIT_CACHE_KEY = `${CacheStorageNamespace.IntegrationTests}:${CacheStorageNamespace.EngineWorkspace}:two-factor-authentication-otp:${USER_DATA_SEED_IDS.PHIL}:${SEED_APPLE_WORKSPACE_ID}`;

const clearRateLimitBucket = async (): Promise<void> => {
  const redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379');

  try {
    await redis.del(RATE_LIMIT_CACHE_KEY);
  } finally {
    redis.disconnect();
  }
};

describe('Two-factor authentication OTP rate limiting (integration)', () => {
  beforeAll(clearRateLimitBucket);
  afterAll(clearRateLimitBucket);

  it('rejects further attempts once the per-user bucket is spent', async () => {
    let limitReachedError:
      | { extensions?: { code?: string; subCode?: string } }
      | undefined;
    let attemptsBeforeLimit = 0;

    for (
      let attempt = 0;
      attempt <= TWO_FACTOR_AUTHENTICATION_OTP_RATE_LIMIT_MAX;
      attempt++
    ) {
      const { errors } = await verifyTwoFactorAuthenticationMethod({
        otp: '000000',
        accessToken: APPLE_PHIL_GUEST_ACCESS_TOKEN,
        expectToFail: true,
      });

      limitReachedError = errors?.find(
        (error) => error.extensions?.subCode === 'LIMIT_REACHED',
      );

      if (limitReachedError !== undefined) {
        break;
      }

      attemptsBeforeLimit++;
    }

    expect(attemptsBeforeLimit).toBe(
      TWO_FACTOR_AUTHENTICATION_OTP_RATE_LIMIT_MAX,
    );
    expect(limitReachedError).toBeDefined();
  });
});
