import gql from 'graphql-tag';
import IORedis from 'ioredis';
import { authenticator } from 'otplib';
import { type QueryRunner } from 'typeorm';
import { buildAppleWorkspaceOrigin } from 'test/integration/graphql/utils/build-apple-workspace-origin.util';
import { generateTwoFactorAuthenticationRecoveryCode } from 'test/integration/graphql/utils/generate-two-factor-authentication-recovery-code.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getAuthTokensFromOtp } from 'test/integration/graphql/utils/get-auth-tokens-from-otp.util';
import { getAuthTokensFromTwoFactorAuthenticationRecoveryCode } from 'test/integration/graphql/utils/get-auth-tokens-from-two-factor-authentication-recovery-code.util';
import { getLoginTokenFromCredentialsQueryFactory } from 'test/integration/graphql/utils/get-login-token-from-credentials.query-factory.util';
import { initiateOtpProvisioning } from 'test/integration/graphql/utils/initiate-otp-provisioning.util';
import { initiateOtpProvisioningForAuthenticatedUser } from 'test/integration/graphql/utils/initiate-otp-provisioning-for-authenticated-user.util';
import { renewToken } from 'test/integration/graphql/utils/renew-token.util';
import { verifyTwoFactorAuthenticationMethod } from 'test/integration/graphql/utils/verify-two-factor-authentication-method.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';

import { AppTokenType } from 'src/engine/core-modules/app-token/app-token.entity';
import { acquireUserAuthenticationLock } from 'src/engine/core-modules/auth/utils/acquire-user-authentication-lock.util';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TOKEN_BUCKET_THROTTLE_KEY_PREFIX } from 'src/engine/core-modules/throttler/constants/token-bucket-throttle-key-prefix.constant';
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

const clearTwoFactorAuthenticationRateLimits = async (): Promise<void> => {
  const redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379');

  try {
    const keys = await redis.keys(
      `${CacheStorageNamespace.IntegrationTests}:${CacheStorageNamespace.EngineWorkspace}:${TOKEN_BUCKET_THROTTLE_KEY_PREFIX}:two-factor-authentication-*`,
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

const insertMethodRows = async (
  rows: TwoFactorAuthenticationMethodRow[],
): Promise<void> => {
  for (const row of rows) {
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
};

const deleteRecoveryCodes = () =>
  global.testDataSource.query(
    `DELETE FROM core."appToken" WHERE "type" = $1 AND "userId" = ANY($2)`,
    [
      AppTokenType.TwoFactorAuthenticationRecoveryCode,
      [
        USER_DATA_SEED_IDS.JANE,
        USER_DATA_SEED_IDS.JONY,
        USER_DATA_SEED_IDS.PHIL,
      ],
    ],
  );

const selectPendingRecoveryCodes = (): Promise<{ id: string }[]> =>
  global.testDataSource.query(
    `SELECT "id" FROM core."appToken" WHERE "type" = $1 AND "userId" = $2 AND "workspaceId" = $3 AND "deletedAt" IS NULL AND "revokedAt" IS NULL`,
    [
      AppTokenType.TwoFactorAuthenticationRecoveryCode,
      USER_DATA_SEED_IDS.JONY,
      SEED_APPLE_WORKSPACE_ID,
    ],
  );

const selectOpenRecoveryCodes = (): Promise<{ id: string }[]> =>
  global.testDataSource.query(
    `SELECT "id" FROM core."appToken" WHERE "type" = $1 AND "userId" = $2 AND "workspaceId" = $3 AND "revokedAt" IS NULL`,
    [
      AppTokenType.TwoFactorAuthenticationRecoveryCode,
      USER_DATA_SEED_IDS.JONY,
      SEED_APPLE_WORKSPACE_ID,
    ],
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
  expiresAt,
  revokedAt = null,
}: {
  recoveryCode: string;
  workspaceId: string;
  expiresAt: Date;
  revokedAt?: Date | null;
}) =>
  global.testDataSource.query(
    `INSERT INTO core."appToken" ("userId", "workspaceId", "type", "value", "expiresAt", "revokedAt") VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      USER_DATA_SEED_IDS.JONY,
      workspaceId,
      AppTokenType.TwoFactorAuthenticationRecoveryCode,
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
            isAwaitingRecoveryEnrollment
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

const holdUserAuthenticationLock = async (
  userId: string,
): Promise<QueryRunner> => {
  const queryRunner = global.testDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();
  await acquireUserAuthenticationLock({
    entityManager: queryRunner.manager,
    userId,
    mode: 'exclusive',
  });

  return queryRunner;
};

const waitUntilARequestAwaitsTheUserAuthenticationLock =
  async (): Promise<void> => {
    for (let attempt = 0; attempt < 100; attempt++) {
      const waitingLocks = await global.testDataSource.query(
        `SELECT 1 FROM pg_locks WHERE "locktype" = 'advisory' AND NOT "granted"`,
      );

      if (waitingLocks.length > 0) {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    throw new Error('No request waited on the user authentication lock');
  };

const releaseUserAuthenticationLock = async (queryRunner: QueryRunner) => {
  if (queryRunner.isTransactionActive) {
    await queryRunner.rollbackTransaction();
  }

  await queryRunner.release();
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

    await insertMethodRows(janeOriginalMethodRows);

    await clearTwoFactorAuthenticationRateLimits();
  });

  describe('issuing a code', () => {
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

    it('refuses an admin who has no authenticator in this workspace', async () => {
      const janeMethodRows = await selectMethodRows(
        USER_WORKSPACE_DATA_SEED_IDS.JANE,
      );

      await deleteMethodRows(USER_WORKSPACE_DATA_SEED_IDS.JANE);

      try {
        const { errors } = await generateTwoFactorAuthenticationRecoveryCode({
          userId: USER_DATA_SEED_IDS.JONY,
          otp: '000000',
          accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
          expectToFail: true,
        });

        expect(errors?.[0]?.extensions?.subCode).toBe(
          'STEP_UP_AUTHENTICATION_REQUIRED',
        );
        expect(await selectPendingRecoveryCodes()).toHaveLength(0);
      } finally {
        await insertMethodRows(janeMethodRows);
      }
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
          isAwaitingRecoveryEnrollment: false,
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
        expiresAt: new Date(Date.now() - 60_000),
      });
      await insertRecoveryCode({
        recoveryCode: 'REVOK-EDCOD-E0000-00002',
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: new Date(),
      });
      await insertRecoveryCode({
        recoveryCode: 'OTHER-WORKS-PACE0-00003',
        workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
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

      const { data: otpData, errors: otpErrors } = await getAuthTokensFromOtp({
        loginToken: otpLoginToken,
        otp: await generateOtp(jonySecret),
        origin: buildAppleWorkspaceOrigin(),
        expectToFail: false,
      });

      expect(otpErrors).toBeUndefined();

      const rotatedRefreshToken =
        otpData.getAuthTokensFromOTP.tokens.refreshToken.token;

      const rotationResponse = await renewToken(rotatedRefreshToken);

      expect(rotationResponse.body.errors).toBeUndefined();

      const refreshTokenFromBeforeRecovery =
        rotationResponse.body.data.renewToken.tokens.refreshToken.token;

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
          ?.accessOrWorkspaceAgnosticToken.token,
      ).toBeDefined();
      expect(
        data.getAuthTokensFromTwoFactorAuthenticationRecoveryCode
          .provisioningUri,
      ).toBeNull();
      expect(await selectMethodRows(USER_WORKSPACE_DATA_SEED_IDS.JONY)).toEqual(
        [],
      );

      const { errors: loginTokenReplayErrors } =
        await getAuthTokensFromLoginToken({
          loginToken,
          origin: buildAppleWorkspaceOrigin(),
          expectToFail: true,
        });

      expect(loginTokenReplayErrors?.[0]?.extensions?.code).toBe(
        'UNAUTHENTICATED',
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

      for (const refreshToken of [
        refreshTokenFromBeforeRecovery,
        rotatedRefreshToken,
      ]) {
        const renewResponse = await renewToken(refreshToken);

        expect(renewResponse.body.data).toBeNull();
        expect(renewResponse.body.errors?.[0]?.extensions?.code).toBe(
          'FORBIDDEN',
        );
      }

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

    it('hands the replacement authenticator only to the redeeming request when the workspace enforces two-factor authentication', async () => {
      const { recoveryCode } = await generateCodeForJony();

      await setTwoFactorAuthenticationEnforced(true);

      try {
        const { data, errors } =
          await getAuthTokensFromTwoFactorAuthenticationRecoveryCode({
            loginToken: await getJonyLoginToken(),
            recoveryCode,
            origin: buildAppleWorkspaceOrigin(),
            expectToFail: false,
          });

        expect(errors).toBeUndefined();

        const { tokens, provisioningUri } =
          data.getAuthTokensFromTwoFactorAuthenticationRecoveryCode;

        expect(tokens).toBeNull();

        const replacementSecret =
          provisioningUri?.match(/[?&]secret=([^&]+)/)?.[1];

        expect(replacementSecret).toBeDefined();

        const methodRows = await selectMethodRows(
          USER_WORKSPACE_DATA_SEED_IDS.JONY,
        );

        expect(methodRows).toHaveLength(1);
        expect(methodRows[0].status).toBe('PENDING');

        const { errors: provisioningErrors } = await initiateOtpProvisioning({
          loginToken: await getJonyLoginToken(),
          origin: buildAppleWorkspaceOrigin(),
          expectToFail: true,
        });

        expect(provisioningErrors?.[0]?.extensions?.subCode).toBe(
          'RECOVERY_ENROLLMENT_RESTRICTED',
        );

        const { errors: authenticatedProvisioningErrors } =
          await initiateOtpProvisioningForAuthenticatedUser({
            accessToken: APPLE_JONY_MEMBER_ACCESS_TOKEN,
            expectToFail: true,
          });

        expect(authenticatedProvisioningErrors?.[0]?.extensions?.subCode).toBe(
          'RECOVERY_ENROLLMENT_RESTRICTED',
        );
        expect(
          (await selectMethodRows(USER_WORKSPACE_DATA_SEED_IDS.JONY))[0].secret,
        ).toBe(methodRows[0].secret);

        const awaitingStatus = await getRecoveryStatus(USER_DATA_SEED_IDS.JONY);

        expect(
          awaitingStatus.data.twoFactorAuthenticationRecoveryStatus,
        ).toMatchObject({
          hasVerifiedTwoFactorAuthenticationMethod: false,
          isAwaitingRecoveryEnrollment: true,
        });

        await generateCodeForJony();

        const { errors: otpErrors } = await getAuthTokensFromOtp({
          loginToken: await getJonyLoginToken(),
          otp: await generateOtp(replacementSecret as string),
          origin: buildAppleWorkspaceOrigin(),
          expectToFail: false,
        });

        expect(otpErrors).toBeUndefined();
        expect(await selectOpenRecoveryCodes()).toEqual([]);

        jonySecret = replacementSecret as string;
      } finally {
        await setTwoFactorAuthenticationEnforced(false);
      }
    });

    it('keeps the enrollment reservation of a recovery that lands while an OTP sign-in is in flight', async () => {
      const loginToken = await getJonyLoginToken();
      const otp = await generateOtp(jonySecret);
      const lock = await holdUserAuthenticationLock(USER_DATA_SEED_IDS.JONY);

      let otpSignIn: ReturnType<typeof getAuthTokensFromOtp> | undefined;

      try {
        otpSignIn = getAuthTokensFromOtp({
          loginToken,
          otp,
          origin: buildAppleWorkspaceOrigin(),
          expectToFail: true,
        });

        await waitUntilARequestAwaitsTheUserAuthenticationLock();

        await lock.query(
          `DELETE FROM core."twoFactorAuthenticationMethod" WHERE "userWorkspaceId" = $1`,
          [USER_WORKSPACE_DATA_SEED_IDS.JONY],
        );
        await lock.query(
          `INSERT INTO core."appToken" ("userId", "workspaceId", "type", "value", "expiresAt", "deletedAt") VALUES ($1, $2, $3, $4, now() + interval '1 hour', now())`,
          [
            USER_DATA_SEED_IDS.JONY,
            SEED_APPLE_WORKSPACE_ID,
            AppTokenType.TwoFactorAuthenticationRecoveryCode,
            hashTwoFactorAuthenticationRecoveryCode('RESERVED-ENROLLMENT'),
          ],
        );
        await lock.commitTransaction();
      } finally {
        await releaseUserAuthenticationLock(lock);
      }

      const { errors } = await otpSignIn;

      expect(errors?.[0]?.extensions?.subCode).toBe('INVALID_CONFIGURATION');
      expect(await selectOpenRecoveryCodes()).toHaveLength(1);

      await deleteRecoveryCodes();
      jonySecret = await enrollAuthenticator(APPLE_JONY_MEMBER_ACCESS_TOKEN);
    });

    it('refuses a refresh token renewal that was in flight when a recovery revoked the sessions', async () => {
      const { data } = await getAuthTokensFromOtp({
        loginToken: await getJonyLoginToken(),
        otp: await generateOtp(jonySecret),
        origin: buildAppleWorkspaceOrigin(),
        expectToFail: false,
      });

      const lock = await holdUserAuthenticationLock(USER_DATA_SEED_IDS.JONY);

      let renewal: ReturnType<typeof renewToken> | undefined;

      try {
        renewal = renewToken(
          data.getAuthTokensFromOTP.tokens.refreshToken.token,
        );

        await waitUntilARequestAwaitsTheUserAuthenticationLock();

        await lock.query(
          `UPDATE core."appToken" SET "revokedAt" = COALESCE("revokedAt", now()), "context" = COALESCE("context", '{}'::jsonb) || jsonb_build_object('revokedReason', $4::text) WHERE "userId" = $1 AND "workspaceId" = $2 AND "type" = $3`,
          [
            USER_DATA_SEED_IDS.JONY,
            SEED_APPLE_WORKSPACE_ID,
            AppTokenType.RefreshToken,
            UserSessionRevokedReason.TwoFactorAuthenticationReset,
          ],
        );
        await lock.commitTransaction();
      } finally {
        await releaseUserAuthenticationLock(lock);
      }

      const response = await renewal;

      expect(response.body.data).toBeNull();
      expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
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
