import IORedis from 'ioredis';
import { isDefined } from 'twenty-shared/utils';
import { verifyTwoFactorAuthenticationMethod } from 'test/integration/graphql/utils/verify-two-factor-authentication-method.util';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TOKEN_BUCKET_THROTTLE_KEY_PREFIX } from 'src/engine/core-modules/throttler/constants/token-bucket-throttle-key-prefix.constant';
import { TWO_FACTOR_AUTHENTICATION_OTP_RATE_LIMIT_MAX } from 'src/engine/core-modules/two-factor-authentication/constants/two-factor-authentication-otp-rate-limit.constant';
import { buildTwoFactorAuthenticationOtpRateLimitKey } from 'src/engine/core-modules/two-factor-authentication/utils/build-two-factor-authentication-otp-rate-limit-key.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const RATE_LIMIT_KEY = buildTwoFactorAuthenticationOtpRateLimitKey({
  userId: USER_DATA_SEED_IDS.PHIL,
  workspaceId: SEED_APPLE_WORKSPACE_ID,
});

const RATE_LIMIT_CACHE_KEY = `${CacheStorageNamespace.IntegrationTests}:${CacheStorageNamespace.EngineWorkspace}:${TOKEN_BUCKET_THROTTLE_KEY_PREFIX}:${RATE_LIMIT_KEY}`;

const clearRateLimitBucket = async (): Promise<void> => {
  const redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379');

  try {
    await redis.del(RATE_LIMIT_CACHE_KEY);
  } finally {
    redis.disconnect();
  }
};

const isLimitReachedError = (error: {
  extensions?: { subCode?: string };
}): boolean => error.extensions?.subCode === 'LIMIT_REACHED';

describe('Two-factor authentication OTP rate limiting (integration)', () => {
  beforeEach(clearRateLimitBucket);
  afterAll(clearRateLimitBucket);

  it('admits no more than the limit when attempts arrive concurrently', async () => {
    const concurrentAttempts = TWO_FACTOR_AUTHENTICATION_OTP_RATE_LIMIT_MAX * 2;

    const responses = await Promise.all(
      Array.from({ length: concurrentAttempts }, () =>
        verifyTwoFactorAuthenticationMethod({
          otp: '000000',
          accessToken: APPLE_PHIL_GUEST_ACCESS_TOKEN,
          expectToFail: true,
        }),
      ),
    );

    const admittedAttempts = responses.filter(
      ({ errors }) => !(errors ?? []).some(isLimitReachedError),
    ).length;

    expect(admittedAttempts).toBe(TWO_FACTOR_AUTHENTICATION_OTP_RATE_LIMIT_MAX);
  });

  it('rejects further attempts once the per-user bucket is spent', async () => {
    let limitReachedError:
      | {
          extensions?: {
            code?: string;
            subCode?: string;
            userFriendlyMessage?: string;
          };
        }
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

      limitReachedError = errors?.find(isLimitReachedError);

      if (isDefined(limitReachedError)) {
        break;
      }

      attemptsBeforeLimit++;
    }

    expect(attemptsBeforeLimit).toBe(
      TWO_FACTOR_AUTHENTICATION_OTP_RATE_LIMIT_MAX,
    );
    expect(limitReachedError?.extensions?.userFriendlyMessage).toBe(
      'Rate limit reached. Please try again later.',
    );
  });
});
