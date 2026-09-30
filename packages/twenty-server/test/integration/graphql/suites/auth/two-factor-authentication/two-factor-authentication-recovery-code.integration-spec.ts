import gql from 'graphql-tag';
import IORedis from 'ioredis';
import { authenticator } from 'otplib';
import { buildAppleWorkspaceOrigin } from 'test/integration/graphql/utils/build-apple-workspace-origin.util';
import { generateTwoFactorAuthenticationRecoveryCode } from 'test/integration/graphql/utils/generate-two-factor-authentication-recovery-code.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getAuthTokensFromOtp } from 'test/integration/graphql/utils/get-auth-tokens-from-otp.util';
import { getAuthTokensFromTwoFactorAuthenticationRecoveryCode } from 'test/integration/graphql/utils/get-auth-tokens-from-two-factor-authentication-recovery-code.util';
import { getLoginTokenFromCredentialsQueryFactory } from 'test/integration/graphql/utils/get-login-token-from-credentials.query-factory.util';
import { initiateOtpProvisioningForAuthenticatedUser } from 'test/integration/graphql/utils/initiate-otp-provisioning-for-authenticated-user.util';
import { verifyTwoFactorAuthenticationMethod } from 'test/integration/graphql/utils/verify-two-factor-authentication-method.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import { FeatureFlagKey } from 'twenty-shared/types';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_REDEMPTION_RATE_LIMIT_MAX } from 'src/engine/core-modules/two-factor-authentication/constants/two-factor-authentication-recovery-code.constant';
import { hashTwoFactorAuthenticationRecoveryCode } from 'src/engine/core-modules/two-factor-authentication/utils/hash-two-factor-authentication-recovery-code.util';
import { UserSessionRevokedReason } from 'src/engine/core-modules/user-session/types/user-session-revoked-reason.type';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
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

const insertRecoveryCode = async ({
  recoveryCode,
  workspaceId,
  userWorkspaceId,
  expiresAt,
  revokedAt = null,
}: {
  recoveryCode: string;
  workspaceId: string;
  userWorkspaceId: string;
  expiresAt: Date;
  revokedAt?: Date | null;
}) =>
  global.testDataSource.query(
    `INSERT INTO core."twoFactorAuthenticationRecoveryCode" ("workspaceId", "userWorkspaceId", "codeHash", "expiresAt", "revokedAt") VALUES ($1, $2, $3, $4, $5)`,
    [
      workspaceId,
      userWorkspaceId,
      hashTwoFactorAuthenticationRecoveryCode(recoveryCode),
      expiresAt,
      revokedAt,
    ],
  );

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

const setTwoFactorAuthenticationEnforced = async (
  isTwoFactorAuthenticationEnforced: boolean,
) => {
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        mutation UpdateWorkspace($isTwoFactorAuthenticationEnforced: Boolean) {
          updateWorkspace(
            data: {
              isTwoFactorAuthenticationEnforced: $isTwoFactorAuthenticationEnforced
            }
          ) {
            id
          }
        }
      `,
      variables: { isTwoFactorAuthenticationEnforced },
    },
    APPLE_JANE_ADMIN_ACCESS_TOKEN,
  );

  expect(response.body.errors).toBeUndefined();
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

  describe('redeeming a code', () => {
    it('rejects codes that are unknown, expired, revoked or issued in another workspace', async () => {
      await insertRecoveryCode({
        recoveryCode: 'EXPIR-EDCOD-E0000-00001',
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
        expiresAt: new Date(Date.now() - 60_000),
      });
      await insertRecoveryCode({
        recoveryCode: 'REVOK-EDCOD-E0000-00002',
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: new Date(),
      });
      await insertRecoveryCode({
        recoveryCode: 'OTHER-WORKS-PACE0-00003',
        workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY_ACME,
        expiresAt: new Date(Date.now() + 60_000),
      });

      const loginToken = await getJonyLoginToken();

      for (const recoveryCode of [
        'UNKNO-WNCOD-E0000-00000',
        'EXPIR-EDCOD-E0000-00001',
        'REVOK-EDCOD-E0000-00002',
        'OTHER-WORKS-PACE0-00003',
      ]) {
        const { errors } =
          await getAuthTokensFromTwoFactorAuthenticationRecoveryCode({
            loginToken,
            recoveryCode,
            origin: buildAppleWorkspaceOrigin(),
            expectToFail: true,
          });

        expect(errors?.[0]?.extensions?.subCode).toBe('INVALID_RECOVERY_CODE');
      }

      expect(
        await selectMethodRows(USER_WORKSPACE_DATA_SEED_IDS.JONY),
      ).toHaveLength(1);
    });

    it('removes the authenticator, signs out other sessions and works only once', async () => {
      const otpLoginToken = await getJonyLoginToken();

      const { errors: otpErrors } = await getAuthTokensFromOtp({
        loginToken: otpLoginToken,
        otp: await generateOtp(jonySecret),
        origin: buildAppleWorkspaceOrigin(),
        expectToFail: false,
      });

      expect(otpErrors).toBeUndefined();

      const { recoveryCode } = await generateCodeForJony();
      const loginToken = await getJonyLoginToken();

      const { errors: loginErrors } = await getAuthTokensFromLoginToken({
        loginToken,
        origin: buildAppleWorkspaceOrigin(),
        expectToFail: true,
      });

      expect(loginErrors?.[0]?.extensions?.subCode).toBe(
        'TWO_FACTOR_AUTHENTICATION_VERIFICATION_REQUIRED',
      );

      const { data, errors } =
        await getAuthTokensFromTwoFactorAuthenticationRecoveryCode({
          loginToken,
          recoveryCode: recoveryCode.toLowerCase(),
          origin: buildAppleWorkspaceOrigin(),
          expectToFail: false,
        });

      expect(errors).toBeUndefined();
      expect(
        data.getAuthTokensFromTwoFactorAuthenticationRecoveryCode.tokens
          .accessOrWorkspaceAgnosticToken.token,
      ).toBeDefined();
      expect(await selectMethodRows(USER_WORKSPACE_DATA_SEED_IDS.JONY)).toEqual(
        [],
      );

      const revokedSessions = await global.testDataSource.query(
        `SELECT "revokedReason" FROM core."userSession" WHERE "userId" = $1 AND "workspaceId" = $2 AND "revokedAt" IS NOT NULL AND "revokedReason" = $3`,
        [
          USER_DATA_SEED_IDS.JONY,
          SEED_APPLE_WORKSPACE_ID,
          UserSessionRevokedReason.TwoFactorAuthenticationReset,
        ],
      );

      expect(revokedSessions.length).toBeGreaterThan(0);

      const { errors: replayErrors } =
        await getAuthTokensFromTwoFactorAuthenticationRecoveryCode({
          loginToken: await getJonyLoginToken(),
          recoveryCode,
          origin: buildAppleWorkspaceOrigin(),
          expectToFail: true,
        });

      expect(replayErrors?.[0]?.extensions?.subCode).toBe(
        'INVALID_RECOVERY_CODE',
      );

      const { errors: signInErrors } = await getAuthTokensFromLoginToken({
        loginToken: await getJonyLoginToken(),
        origin: buildAppleWorkspaceOrigin(),
        expectToFail: false,
      });

      expect(signInErrors).toBeUndefined();

      jonySecret = await enrollAuthenticator(APPLE_JONY_MEMBER_ACCESS_TOKEN);
    });

    it('admits exactly one of two simultaneous redemptions and keeps the winner signed in', async () => {
      const { recoveryCode } = await generateCodeForJony();
      const loginToken = await getJonyLoginToken();
      const [{ now: raceStartedAt }] =
        await global.testDataSource.query('SELECT now()');

      const responses = await Promise.all(
        [0, 1].map(() =>
          getAuthTokensFromTwoFactorAuthenticationRecoveryCode({
            loginToken,
            recoveryCode,
            origin: buildAppleWorkspaceOrigin(),
          }),
        ),
      );

      expect(
        responses.filter(({ errors }) => errors === undefined),
      ).toHaveLength(1);

      const activeSessionsFromRace = await global.testDataSource.query(
        `SELECT "id" FROM core."userSession" WHERE "userId" = $1 AND "workspaceId" = $2 AND "revokedAt" IS NULL AND "createdAt" >= $3`,
        [USER_DATA_SEED_IDS.JONY, SEED_APPLE_WORKSPACE_ID, raceStartedAt],
      );

      expect(activeSessionsFromRace).toHaveLength(1);

      jonySecret = await enrollAuthenticator(APPLE_JONY_MEMBER_ACCESS_TOKEN);
    });

    it('revokes the previous code when a new one is issued, and pending codes after a successful authenticator sign-in', async () => {
      const { recoveryCode: firstRecoveryCode } = await generateCodeForJony();
      const { recoveryCode: secondRecoveryCode } = await generateCodeForJony();

      const { errors: firstCodeErrors } =
        await getAuthTokensFromTwoFactorAuthenticationRecoveryCode({
          loginToken: await getJonyLoginToken(),
          recoveryCode: firstRecoveryCode,
          origin: buildAppleWorkspaceOrigin(),
          expectToFail: true,
        });

      expect(firstCodeErrors?.[0]?.extensions?.subCode).toBe(
        'INVALID_RECOVERY_CODE',
      );

      await getAuthTokensFromOtp({
        loginToken: await getJonyLoginToken(),
        otp: await generateOtp(jonySecret),
        origin: buildAppleWorkspaceOrigin(),
        expectToFail: false,
      });

      const { errors: secondCodeErrors } =
        await getAuthTokensFromTwoFactorAuthenticationRecoveryCode({
          loginToken: await getJonyLoginToken(),
          recoveryCode: secondRecoveryCode,
          origin: buildAppleWorkspaceOrigin(),
          expectToFail: true,
        });

      expect(secondCodeErrors?.[0]?.extensions?.subCode).toBe(
        'INVALID_RECOVERY_CODE',
      );
    });

    it('sends the member to setup when the workspace enforces two-factor authentication', async () => {
      const { recoveryCode } = await generateCodeForJony();

      await setTwoFactorAuthenticationEnforced(true);

      try {
        const { errors } =
          await getAuthTokensFromTwoFactorAuthenticationRecoveryCode({
            loginToken: await getJonyLoginToken(),
            recoveryCode,
            origin: buildAppleWorkspaceOrigin(),
            expectToFail: true,
          });

        expect(errors?.[0]?.extensions?.subCode).toBe(
          'TWO_FACTOR_AUTHENTICATION_PROVISION_REQUIRED',
        );
        expect(
          await selectMethodRows(USER_WORKSPACE_DATA_SEED_IDS.JONY),
        ).toEqual([]);
      } finally {
        await setTwoFactorAuthenticationEnforced(false);
      }

      jonySecret = await enrollAuthenticator(APPLE_JONY_MEMBER_ACCESS_TOKEN);
    });

    it('stops accepting guesses once the member bucket is spent', async () => {
      const loginToken = await getJonyLoginToken();
      const subCodes: string[] = [];

      for (
        let attempt = 0;
        attempt <=
        TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_REDEMPTION_RATE_LIMIT_MAX;
        attempt++
      ) {
        const { errors } =
          await getAuthTokensFromTwoFactorAuthenticationRecoveryCode({
            loginToken,
            recoveryCode: 'WRONG-GUESS-00000-00000',
            origin: buildAppleWorkspaceOrigin(),
            expectToFail: true,
          });

        subCodes.push(errors?.[0]?.extensions?.subCode);
      }

      expect(subCodes.slice(0, -1)).toEqual(
        Array(
          TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_REDEMPTION_RATE_LIMIT_MAX,
        ).fill('INVALID_RECOVERY_CODE'),
      );
      expect(subCodes[subCodes.length - 1]).toBe('LIMIT_REACHED');
    });
  });

  describe('server admin panel', () => {
    const generateAsServerAdmin = async (workspaceId: string) => {
      const response = await makeAdminPanelApiRequest({
        query: gql`
          mutation GenerateTwoFactorAuthenticationRecoveryCodeAsServerAdmin(
            $userId: UUID!
            $workspaceId: UUID!
            $otp: String
          ) {
            generateTwoFactorAuthenticationRecoveryCodeAsServerAdmin(
              userId: $userId
              workspaceId: $workspaceId
              otp: $otp
            ) {
              recoveryCode
              expiresAt
            }
          }
        `,
        variables: {
          userId: USER_DATA_SEED_IDS.JONY,
          workspaceId,
          otp: await generateOtp(janeSecret),
        },
      });

      return response.body;
    };

    it('issues a code for a member of the given workspace', async () => {
      const { data, errors } = await generateAsServerAdmin(
        SEED_APPLE_WORKSPACE_ID,
      );

      expect(errors).toBeUndefined();
      expect(
        data.generateTwoFactorAuthenticationRecoveryCodeAsServerAdmin
          .recoveryCode,
      ).toMatch(/^[0-9A-Z]{5}(-[0-9A-Z]{5}){3}$/);
    });

    it('reaches members of other workspaces but still requires an authenticator to recover', async () => {
      const { errors } = await generateAsServerAdmin(
        SEED_YCOMBINATOR_WORKSPACE_ID,
      );

      expect(errors?.[0]?.extensions?.subCode).toBe(
        'RECOVERY_CODE_TARGET_NOT_ALLOWED',
      );
    });
  });
});
