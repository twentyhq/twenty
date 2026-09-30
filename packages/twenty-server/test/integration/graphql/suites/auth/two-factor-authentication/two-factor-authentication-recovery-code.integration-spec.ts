import gql from 'graphql-tag';
import IORedis from 'ioredis';
import { authenticator } from 'otplib';
import { buildAppleWorkspaceOrigin } from 'test/integration/graphql/utils/build-apple-workspace-origin.util';
import { generateTwoFactorAuthenticationRecoveryCode } from 'test/integration/graphql/utils/generate-two-factor-authentication-recovery-code.util';
import { getAuthTokensFromOtp } from 'test/integration/graphql/utils/get-auth-tokens-from-otp.util';
import { getLoginTokenFromCredentialsQueryFactory } from 'test/integration/graphql/utils/get-login-token-from-credentials.query-factory.util';
import { initiateOtpProvisioningForAuthenticatedUser } from 'test/integration/graphql/utils/initiate-otp-provisioning-for-authenticated-user.util';
import { verifyTwoFactorAuthenticationMethod } from 'test/integration/graphql/utils/verify-two-factor-authentication-method.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const TOTP_STEP_DURATION_MS = 30_000;
const MINIMUM_STEP_REMAINING_MS = 5_000;
const JONY_EMAIL = 'jony.ive@apple.dev';
const SEEDED_PASSWORD = 'tim@apple.dev';

type TwoFactorAuthenticationMethodRow = Record<string, unknown>;

const waitUntilSafelyInsideTotpStep = async (): Promise<void> => {
  const millisecondsRemainingInStep =
    TOTP_STEP_DURATION_MS - (Date.now() % TOTP_STEP_DURATION_MS);

  if (millisecondsRemainingInStep < MINIMUM_STEP_REMAINING_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, millisecondsRemainingInStep + 100),
    );
  }
};

const generateOtp = async (secret: string): Promise<string> => {
  await waitUntilSafelyInsideTotpStep();

  return authenticator.generate(secret);
};

// Step-ups, sign-ins and redemptions all draw from per-user buckets; a suite
// this long would otherwise exhaust them and fail for the wrong reason.
const clearTwoFactorAuthenticationRateLimits = async (): Promise<void> => {
  const redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379');

  try {
    const keys = await redis.keys(
      `${CacheStorageNamespace.IntegrationTests}:${CacheStorageNamespace.EngineWorkspace}:two-factor-authentication-*`,
    );

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } finally {
    redis.disconnect();
  }
};

const selectMethodRows = (
  userWorkspaceId: string,
): Promise<TwoFactorAuthenticationMethodRow[]> =>
  global.testDataSource.query(
    `SELECT * FROM core."twoFactorAuthenticationMethod" WHERE "userWorkspaceId" = $1`,
    [userWorkspaceId],
  );

const deleteMethodRows = (userWorkspaceId: string) =>
  global.testDataSource.query(
    `DELETE FROM core."twoFactorAuthenticationMethod" WHERE "userWorkspaceId" = $1`,
    [userWorkspaceId],
  );

const deleteRecoveryCodes = () =>
  global.testDataSource.query(
    `DELETE FROM core."twoFactorAuthenticationRecoveryCode" WHERE "userWorkspaceId" = ANY($1)`,
    [
      [
        USER_WORKSPACE_DATA_SEED_IDS.JANE,
        USER_WORKSPACE_DATA_SEED_IDS.JONY,
        USER_WORKSPACE_DATA_SEED_IDS.JONY_ACME,
        USER_WORKSPACE_DATA_SEED_IDS.PHIL,
      ],
    ],
  );

const selectPendingRecoveryCodes = (): Promise<{ id: string }[]> =>
  global.testDataSource.query(
    `SELECT "id" FROM core."twoFactorAuthenticationRecoveryCode" WHERE "userWorkspaceId" = $1 AND "usedAt" IS NULL AND "revokedAt" IS NULL`,
    [USER_WORKSPACE_DATA_SEED_IDS.JONY],
  );

const enrollAuthenticator = async (accessToken: string): Promise<string> => {
  const { data } = await initiateOtpProvisioningForAuthenticatedUser({
    accessToken,
    expectToFail: false,
  });

  const secret =
    data.initiateOTPProvisioningForAuthenticatedUser.uri.match(
      /[?&]secret=([^&]+)/,
    )?.[1];

  if (secret === undefined) {
    throw new Error('Expected the otpauth URI to contain a secret');
  }

  await verifyTwoFactorAuthenticationMethod({
    otp: await generateOtp(secret),
    accessToken,
    expectToFail: false,
  });

  return secret;
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

const getRecoveryStatus = async (userId: string) => {
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        query TwoFactorAuthenticationRecoveryStatus($userId: UUID!) {
          twoFactorAuthenticationRecoveryStatus(userId: $userId) {
            hasVerifiedTwoFactorAuthenticationMethod
            pendingRecoveryCodeExpiresAt
          }
        }
      `,
      variables: { userId },
    },
    APPLE_JANE_ADMIN_ACCESS_TOKEN,
  );

  return response.body;
};

describe('Two-factor authentication recovery codes (integration)', () => {
  let janeOriginalMethodRows: TwoFactorAuthenticationMethodRow[];
  let janeSecret: string;
  let jonySecret: string;

  const generateCodeForJony = async () => {
    const { data, errors } = await generateTwoFactorAuthenticationRecoveryCode({
      userId: USER_DATA_SEED_IDS.JONY,
      otp: await generateOtp(janeSecret),
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    return data.generateTwoFactorAuthenticationRecoveryCode;
  };

  beforeAll(async () => {
    await clearTwoFactorAuthenticationRateLimits();
    await deleteRecoveryCodes();

    janeOriginalMethodRows = await selectMethodRows(
      USER_WORKSPACE_DATA_SEED_IDS.JANE,
    );

    await deleteMethodRows(USER_WORKSPACE_DATA_SEED_IDS.JANE);
    await deleteMethodRows(USER_WORKSPACE_DATA_SEED_IDS.JONY);

    janeSecret = await enrollAuthenticator(APPLE_JANE_ADMIN_ACCESS_TOKEN);
    jonySecret = await enrollAuthenticator(APPLE_JONY_MEMBER_ACCESS_TOKEN);
  });

  beforeEach(async () => {
    await clearTwoFactorAuthenticationRateLimits();
  });

  afterAll(async () => {
    await deleteRecoveryCodes();
    await deleteMethodRows(USER_WORKSPACE_DATA_SEED_IDS.JONY);
    await deleteMethodRows(USER_WORKSPACE_DATA_SEED_IDS.JANE);

    for (const row of janeOriginalMethodRows) {
      await global.testDataSource.query(
        `INSERT INTO core."twoFactorAuthenticationMethod" ("id", "workspaceId", "userWorkspaceId", "secret", "status", "strategy", "createdAt", "updatedAt", "deletedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          row.id,
          row.workspaceId,
          row.userWorkspaceId,
          row.secret,
          row.status,
          row.strategy,
          row.createdAt,
          row.updatedAt,
          row.deletedAt,
        ],
      );
    }

    await clearTwoFactorAuthenticationRateLimits();
  });

  describe('issuing a code', () => {
    it('is unavailable while the feature flag is off', async () => {
      await updateFeatureFlag({
        featureFlag:
          FeatureFlagKey.IS_TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_ENABLED,
        value: false,
        expectToFail: false,
      });

      try {
        const { errors } = await generateTwoFactorAuthenticationRecoveryCode({
          userId: USER_DATA_SEED_IDS.JONY,
          otp: await generateOtp(janeSecret),
          accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
          expectToFail: true,
        });

        expect(errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
        expect(await selectPendingRecoveryCodes()).toHaveLength(0);
      } finally {
        await updateFeatureFlag({
          featureFlag:
            FeatureFlagKey.IS_TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_ENABLED,
          value: true,
          expectToFail: false,
        });
      }
    });

    it('is refused to a member without the security permission', async () => {
      const { errors } = await generateTwoFactorAuthenticationRecoveryCode({
        userId: USER_DATA_SEED_IDS.JANE,
        otp: await generateOtp(jonySecret),
        accessToken: APPLE_PHIL_GUEST_ACCESS_TOKEN,
        expectToFail: true,
      });

      expect(errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    });

    it('requires the admin to confirm with their own code', async () => {
      const { errors } = await generateTwoFactorAuthenticationRecoveryCode({
        userId: USER_DATA_SEED_IDS.JONY,
        accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        expectToFail: true,
      });

      expect(errors?.[0]?.extensions?.subCode).toBe(
        'STEP_UP_AUTHENTICATION_REQUIRED',
      );
    });

    it('rejects a wrong confirmation code', async () => {
      const { errors } = await generateTwoFactorAuthenticationRecoveryCode({
        userId: USER_DATA_SEED_IDS.JONY,
        otp: '000000',
        accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        expectToFail: true,
      });

      expect(errors?.[0]?.extensions?.subCode).toBe('INVALID_OTP');
    });

    it('refuses to target the admin themselves', async () => {
      const { errors } = await generateTwoFactorAuthenticationRecoveryCode({
        userId: USER_DATA_SEED_IDS.JANE,
        otp: await generateOtp(janeSecret),
        accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        expectToFail: true,
      });

      expect(errors?.[0]?.extensions?.subCode).toBe(
        'RECOVERY_CODE_TARGET_NOT_ALLOWED',
      );
    });

    it('refuses a member who has no authenticator to recover', async () => {
      const { errors } = await generateTwoFactorAuthenticationRecoveryCode({
        userId: USER_DATA_SEED_IDS.PHIL,
        otp: await generateOtp(janeSecret),
        accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        expectToFail: true,
      });

      expect(errors?.[0]?.extensions?.subCode).toBe(
        'RECOVERY_CODE_TARGET_NOT_ALLOWED',
      );
    });

    it('reports the pending code in the member status and can be revoked', async () => {
      const { expiresAt } = await generateCodeForJony();

      const statusWithCode = await getRecoveryStatus(USER_DATA_SEED_IDS.JONY);

      expect(statusWithCode.errors).toBeUndefined();
      expect(statusWithCode.data.twoFactorAuthenticationRecoveryStatus).toEqual(
        {
          hasVerifiedTwoFactorAuthenticationMethod: true,
          pendingRecoveryCodeExpiresAt: expiresAt,
        },
      );

      const revokeResponse = await makeMetadataApiRequest(
        {
          query: gql`
            mutation RevokeTwoFactorAuthenticationRecoveryCode($userId: UUID!) {
              revokeTwoFactorAuthenticationRecoveryCode(userId: $userId)
            }
          `,
          variables: { userId: USER_DATA_SEED_IDS.JONY },
        },
        APPLE_JANE_ADMIN_ACCESS_TOKEN,
      );

      expect(
        revokeResponse.body.data.revokeTwoFactorAuthenticationRecoveryCode,
      ).toBe(true);

      const statusAfterRevoke = await getRecoveryStatus(
        USER_DATA_SEED_IDS.JONY,
      );

      expect(
        statusAfterRevoke.data.twoFactorAuthenticationRecoveryStatus
          .pendingRecoveryCodeExpiresAt,
      ).toBeNull();
    });

    it('replaces the previous code, and drops a pending code once the member signs in with their authenticator', async () => {
      await generateCodeForJony();
      const { expiresAt } = await generateCodeForJony();

      expect(await selectPendingRecoveryCodes()).toHaveLength(1);
      expect(
        (await getRecoveryStatus(USER_DATA_SEED_IDS.JONY)).data
          .twoFactorAuthenticationRecoveryStatus.pendingRecoveryCodeExpiresAt,
      ).toBe(expiresAt);

      const { errors } = await getAuthTokensFromOtp({
        loginToken: await getJonyLoginToken(),
        otp: await generateOtp(jonySecret),
        origin: buildAppleWorkspaceOrigin(),
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(await selectPendingRecoveryCodes()).toHaveLength(0);
    });

    it('leaves exactly one usable code when two are issued at the same time', async () => {
      const otp = await generateOtp(janeSecret);

      const responses = await Promise.all(
        [0, 1].map(() =>
          generateTwoFactorAuthenticationRecoveryCode({
            userId: USER_DATA_SEED_IDS.JONY,
            otp,
            accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
          }),
        ),
      );

      for (const { errors } of responses) {
        if (errors !== undefined) {
          expect(errors[0]?.extensions?.subCode).toBe(
            'RECOVERY_CODE_ISSUANCE_CONFLICT',
          );
        }
      }

      expect(await selectPendingRecoveryCodes()).toHaveLength(1);

      await deleteRecoveryCodes();
    });
  });
});
