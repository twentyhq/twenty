import IORedis from 'ioredis';
import { authenticator } from 'otplib';
import { buildAppleWorkspaceOrigin } from 'test/integration/graphql/utils/build-apple-workspace-origin.util';
import { getAuthTokensFromOtp } from 'test/integration/graphql/utils/get-auth-tokens-from-otp.util';
import { getLoginTokenFromCredentialsQueryFactory } from 'test/integration/graphql/utils/get-login-token-from-credentials.query-factory.util';
import { initiateOtpProvisioningForAuthenticatedUser } from 'test/integration/graphql/utils/initiate-otp-provisioning-for-authenticated-user.util';
import { verifyTwoFactorAuthenticationMethod } from 'test/integration/graphql/utils/verify-two-factor-authentication-method.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TOKEN_BUCKET_THROTTLE_KEY_PREFIX } from 'src/engine/core-modules/throttler/constants/token-bucket-throttle-key-prefix.constant';
import { buildTwoFactorAuthenticationOtpRateLimitKey } from 'src/engine/core-modules/two-factor-authentication/utils/build-two-factor-authentication-otp-rate-limit-key.util';
import { buildTwoFactorAuthenticationUsedOtpKey } from 'src/engine/core-modules/two-factor-authentication/utils/build-two-factor-authentication-used-otp-key.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const JONY_EMAIL = 'jony.ive@apple.dev';
const SEEDED_PASSWORD = 'tim@apple.dev';
const TOTP_STEP_DURATION_MS = 30_000;
const MINIMUM_STEP_REMAINING_MS = 5_000;

const generateTokenAtEpoch = (secret: string, epochMs: number): string =>
  authenticator.clone({ epoch: epochMs }).generate(secret);

// A previous-step token minted right before a boundary would be two steps old when validated.
const waitUntilSafelyInsideTotpStep = async (): Promise<void> => {
  const millisecondsRemainingInStep =
    TOTP_STEP_DURATION_MS - (Date.now() % TOTP_STEP_DURATION_MS);

  if (millisecondsRemainingInStep < MINIMUM_STEP_REMAINING_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, millisecondsRemainingInStep + 100),
    );
  }
};

const getJonyLoginToken = async (): Promise<string> => {
  const response = await makeMetadataApiRequest(
    getLoginTokenFromCredentialsQueryFactory({
      email: JONY_EMAIL,
      password: SEEDED_PASSWORD,
      origin: buildAppleWorkspaceOrigin(),
    }),
    null,
  );

  return response.body.data.getLoginTokenFromCredentials.loginToken.token;
};

const deleteJonyTwoFactorAuthenticationMethods = async (): Promise<void> => {
  await global.testDataSource.query(
    `DELETE FROM core."twoFactorAuthenticationMethod" WHERE "userWorkspaceId" = $1`,
    [USER_WORKSPACE_DATA_SEED_IDS.JONY],
  );
};

const USED_OTP_CACHE_KEY_PATTERN = `${CacheStorageNamespace.IntegrationTests}:${CacheStorageNamespace.EngineAuthSession}:${buildTwoFactorAuthenticationUsedOtpKey({ methodId: '*', token: '*' })}`;

const RATE_LIMIT_CACHE_KEY = `${CacheStorageNamespace.IntegrationTests}:${CacheStorageNamespace.EngineWorkspace}:${TOKEN_BUCKET_THROTTLE_KEY_PREFIX}:${buildTwoFactorAuthenticationOtpRateLimitKey(
  {
    userId: USER_DATA_SEED_IDS.JONY,
    workspaceId: SEED_APPLE_WORKSPACE_ID,
  },
)}`;

const clearUsedOtpsAndRateLimit = async (): Promise<void> => {
  const redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379');

  try {
    const keys = await redis.keys(USED_OTP_CACHE_KEY_PATTERN);

    await redis.del(RATE_LIMIT_CACHE_KEY, ...keys);
  } finally {
    redis.disconnect();
  }
};

describe('Two-factor authentication TOTP verification (integration)', () => {
  let secret: string;

  beforeAll(async () => {
    await deleteJonyTwoFactorAuthenticationMethods();

    const { data, errors } = await initiateOtpProvisioningForAuthenticatedUser({
      accessToken: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const uri = data.initiateOTPProvisioningForAuthenticatedUser.uri;

    expect(uri).toMatch(/^otpauth:\/\/totp\//);

    const secretFromUri = uri.match(/[?&]secret=([^&]+)/)?.[1];

    if (secretFromUri === undefined || secretFromUri === '') {
      throw new Error('Expected the otpauth URI to contain a secret');
    }

    secret = secretFromUri;
  });

  beforeEach(clearUsedOtpsAndRateLimit);

  afterAll(async () => {
    await deleteJonyTwoFactorAuthenticationMethods();
    await clearUsedOtpsAndRateLimit();
  });

  it('should reject a code that was already accepted', async () => {
    await waitUntilSafelyInsideTotpStep();

    const token = generateTokenAtEpoch(secret, Date.now());

    const firstUse = await verifyTwoFactorAuthenticationMethod({
      otp: token,
      accessToken: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(firstUse.errors).toBeUndefined();
    expect(
      firstUse.data.verifyTwoFactorAuthenticationMethodForAuthenticatedUser
        .success,
    ).toBe(true);

    const replay = await verifyTwoFactorAuthenticationMethod({
      otp: token,
      accessToken: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: true,
    });

    expect(replay.errors?.[0]?.extensions?.subCode).toBe('INVALID_OTP');
    expect(
      replay.data?.verifyTwoFactorAuthenticationMethodForAuthenticatedUser,
    ).toBeFalsy();
  });

  it('should accept a code only once when it is submitted concurrently', async () => {
    await waitUntilSafelyInsideTotpStep();

    const token = generateTokenAtEpoch(secret, Date.now());

    const responses = await Promise.all(
      Array.from({ length: 3 }, () =>
        verifyTwoFactorAuthenticationMethod({
          otp: token,
          accessToken: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        }),
      ),
    );

    const acceptedAttempts = responses.filter(
      ({ errors }) => errors === undefined,
    ).length;
    const rejectedSubCodes = responses.flatMap(
      ({ errors }) => errors?.map((error) => error.extensions?.subCode) ?? [],
    );

    expect(acceptedAttempts).toBe(1);
    expect(rejectedSubCodes).toEqual(['INVALID_OTP', 'INVALID_OTP']);
  });

  it('should reject a code that is more than one step old', async () => {
    const staleToken = generateTokenAtEpoch(
      secret,
      Date.now() - 2 * TOTP_STEP_DURATION_MS,
    );

    const { data, errors } = await verifyTwoFactorAuthenticationMethod({
      otp: staleToken,
      accessToken: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(
      data?.verifyTwoFactorAuthenticationMethodForAuthenticatedUser,
    ).toBeFalsy();
  });

  it('should accept the current code', async () => {
    await waitUntilSafelyInsideTotpStep();

    const currentToken = generateTokenAtEpoch(secret, Date.now());

    const { data, errors } = await verifyTwoFactorAuthenticationMethod({
      otp: currentToken,
      accessToken: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(
      data.verifyTwoFactorAuthenticationMethodForAuthenticatedUser.success,
    ).toBe(true);
  });

  it('should accept the code from the previous step', async () => {
    await waitUntilSafelyInsideTotpStep();

    const previousStepToken = generateTokenAtEpoch(
      secret,
      Date.now() - TOTP_STEP_DURATION_MS,
    );

    const { data, errors } = await verifyTwoFactorAuthenticationMethod({
      otp: previousStepToken,
      accessToken: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(
      data.verifyTwoFactorAuthenticationMethodForAuthenticatedUser.success,
    ).toBe(true);
  });

  it('should reject a code that was already used to sign in', async () => {
    await waitUntilSafelyInsideTotpStep();

    const token = generateTokenAtEpoch(secret, Date.now());

    const firstSignIn = await getAuthTokensFromOtp({
      loginToken: await getJonyLoginToken(),
      otp: token,
      origin: buildAppleWorkspaceOrigin(),
      expectToFail: false,
    });

    expect(firstSignIn.errors).toBeUndefined();
    expect(
      firstSignIn.data.getAuthTokensFromOTP.tokens
        .accessOrWorkspaceAgnosticToken.token,
    ).toBeDefined();

    const replay = await getAuthTokensFromOtp({
      loginToken: await getJonyLoginToken(),
      otp: token,
      origin: buildAppleWorkspaceOrigin(),
      expectToFail: true,
    });

    expect(replay.errors?.[0]?.extensions?.subCode).toBe('INVALID_OTP');
    expect(replay.data?.getAuthTokensFromOTP).toBeFalsy();
  });
});
