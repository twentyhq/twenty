import IORedis from 'ioredis';
import { authenticator } from 'otplib';
import { buildAppleWorkspaceOrigin } from 'test/integration/graphql/utils/build-apple-workspace-origin.util';
import { generateTwoFactorAuthenticationBackupCodes } from 'test/integration/graphql/utils/generate-two-factor-authentication-backup-codes.util';
import { getAuthTokensFromTwoFactorAuthenticationRecoveryCode } from 'test/integration/graphql/utils/get-auth-tokens-from-two-factor-authentication-recovery-code.util';
import { getLoginTokenFromCredentialsQueryFactory } from 'test/integration/graphql/utils/get-login-token-from-credentials.query-factory.util';
import { getTwoFactorAuthenticationBackupCodeStatus } from 'test/integration/graphql/utils/get-two-factor-authentication-backup-code-status.util';
import { initiateOtpProvisioningForAuthenticatedUser } from 'test/integration/graphql/utils/initiate-otp-provisioning-for-authenticated-user.util';
import { verifyTwoFactorAuthenticationMethod } from 'test/integration/graphql/utils/verify-two-factor-authentication-method.util';
import { deleteTwoFactorAuthenticationMethod } from 'test/integration/graphql/suites/user-session/utils/delete-two-factor-authentication-method.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { isDefined } from 'twenty-shared/utils';

import { AppTokenType } from 'src/engine/core-modules/app-token/app-token.entity';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TOKEN_BUCKET_THROTTLE_KEY_PREFIX } from 'src/engine/core-modules/throttler/constants/token-bucket-throttle-key-prefix.constant';
import { buildTwoFactorAuthenticationUsedOtpKey } from 'src/engine/core-modules/two-factor-authentication/utils/build-two-factor-authentication-used-otp-key.util';
import { hashTwoFactorAuthenticationRecoveryCode } from 'src/engine/core-modules/two-factor-authentication/utils/hash-two-factor-authentication-recovery-code.util';
import { UserSessionRevokedReason } from 'src/engine/core-modules/user-session/types/user-session-revoked-reason.type';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const TOTP_STEP_DURATION_MS = 30_000;
const MINIMUM_STEP_REMAINING_MS = 5_000;
const RECOVERY_CODE_LIFETIME_MS = 60 * 60 * 1000;
const JONY_EMAIL = 'jony.ive@apple.dev';
const SEEDED_PASSWORD = 'tim@apple.dev';

const waitUntilSafelyInsideTotpStep = async (): Promise<void> => {
  const millisecondsRemainingInStep =
    TOTP_STEP_DURATION_MS - (Date.now() % TOTP_STEP_DURATION_MS);

  if (millisecondsRemainingInStep < MINIMUM_STEP_REMAINING_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, millisecondsRemainingInStep + 100),
    );
  }
};

const deleteRedisKeys = async (pattern: string): Promise<void> => {
  const redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379');

  try {
    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } finally {
    redis.disconnect();
  }
};

const clearTwoFactorAuthenticationRateLimits = () =>
  deleteRedisKeys(
    `${CacheStorageNamespace.IntegrationTests}:${CacheStorageNamespace.EngineWorkspace}:${TOKEN_BUCKET_THROTTLE_KEY_PREFIX}:two-factor-authentication-*`,
  );

const generateOtp = async (secret: string): Promise<string> => {
  await waitUntilSafelyInsideTotpStep();
  await deleteRedisKeys(
    `${CacheStorageNamespace.IntegrationTests}:${CacheStorageNamespace.EngineAuthSession}:${buildTwoFactorAuthenticationUsedOtpKey({ methodId: '*', token: '*' })}`,
  );

  return authenticator.generate(secret);
};

const deleteJonyMethodRows = () =>
  global.testDataSource.query(
    `DELETE FROM core."twoFactorAuthenticationMethod" WHERE "userWorkspaceId" = $1`,
    [USER_WORKSPACE_DATA_SEED_IDS.JONY],
  );

const deleteJonyBackupCodes = () =>
  global.testDataSource.query(
    `DELETE FROM core."appToken" WHERE "type" = $1 AND "userId" = $2`,
    [AppTokenType.TwoFactorAuthenticationBackupCode, USER_DATA_SEED_IDS.JONY],
  );

const deleteJonyRecoveryCodes = () =>
  global.testDataSource.query(
    `DELETE FROM core."appToken" WHERE "type" = $1 AND "userId" = $2`,
    [AppTokenType.TwoFactorAuthenticationRecoveryCode, USER_DATA_SEED_IDS.JONY],
  );

const insertJonyRecoveryCode = (recoveryCode: string) =>
  global.testDataSource.query(
    `INSERT INTO core."appToken" ("userId", "workspaceId", "type", "value", "expiresAt") VALUES ($1, $2, $3, $4, $5)`,
    [
      USER_DATA_SEED_IDS.JONY,
      SEED_APPLE_WORKSPACE_ID,
      AppTokenType.TwoFactorAuthenticationRecoveryCode,
      hashTwoFactorAuthenticationRecoveryCode(recoveryCode),
      new Date(Date.now() + RECOVERY_CODE_LIFETIME_MS),
    ],
  );

const enrollJonyAuthenticator = async (): Promise<{
  secret: string;
  backupCodes: string[] | null | undefined;
}> => {
  const { data } = await initiateOtpProvisioningForAuthenticatedUser({
    accessToken: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    expectToFail: false,
  });

  const secret =
    data.initiateOTPProvisioningForAuthenticatedUser.uri.match(
      /[?&]secret=([^&]+)/,
    )?.[1];

  if (!isDefined(secret)) {
    throw new Error('Expected the otpauth URI to contain a secret');
  }

  const { data: verifyData } = await verifyTwoFactorAuthenticationMethod({
    otp: await generateOtp(secret),
    accessToken: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    expectToFail: false,
  });

  return {
    secret,
    backupCodes:
      verifyData.verifyTwoFactorAuthenticationMethodForAuthenticatedUser
        .backupCodes,
  };
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

const signInWithCode = async (code: string) =>
  getAuthTokensFromTwoFactorAuthenticationRecoveryCode({
    loginToken: await getJonyLoginToken(),
    recoveryCode: code,
    origin: buildAppleWorkspaceOrigin(),
  });

const countResetSessions = async (): Promise<number> => {
  const resetSessions = await global.testDataSource.query(
    `SELECT 1 FROM core."userSession" WHERE "userId" = $1 AND "workspaceId" = $2 AND "revokedReason" = $3`,
    [
      USER_DATA_SEED_IDS.JONY,
      SEED_APPLE_WORKSPACE_ID,
      UserSessionRevokedReason.TwoFactorAuthenticationReset,
    ],
  );

  return resetSessions.length;
};

const getRemainingBackupCodeCount = async (): Promise<number> => {
  const { data, errors } = await getTwoFactorAuthenticationBackupCodeStatus({
    accessToken: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    expectToFail: false,
  });

  expect(errors).toBeUndefined();

  return data.twoFactorAuthenticationBackupCodeStatus.remainingBackupCodeCount;
};

describe('Two-factor authentication backup codes (integration)', () => {
  let jonySecret: string;
  let jonyBackupCodes: string[];

  beforeAll(async () => {
    await clearTwoFactorAuthenticationRateLimits();
    await deleteJonyBackupCodes();
    await deleteJonyRecoveryCodes();
    await deleteJonyMethodRows();

    const { secret, backupCodes } = await enrollJonyAuthenticator();

    jonySecret = secret;
    jonyBackupCodes = backupCodes ?? [];
  });

  beforeEach(async () => {
    await clearTwoFactorAuthenticationRateLimits();
  });

  afterAll(async () => {
    await deleteJonyBackupCodes();
    await deleteJonyRecoveryCodes();
    await deleteJonyMethodRows();
    await clearTwoFactorAuthenticationRateLimits();
  });

  it('issues ten backup codes when the authenticator is set up and stores only their hashes', async () => {
    expect(jonyBackupCodes).toHaveLength(10);
    expect(await getRemainingBackupCodeCount()).toBe(10);

    const storedValues: { value: string }[] = await global.testDataSource.query(
      `SELECT "value" FROM core."appToken" WHERE "type" = $1 AND "userId" = $2 AND "workspaceId" = $3 AND "revokedAt" IS NULL`,
      [
        AppTokenType.TwoFactorAuthenticationBackupCode,
        USER_DATA_SEED_IDS.JONY,
        SEED_APPLE_WORKSPACE_ID,
      ],
    );

    expect(storedValues.map(({ value }) => value).sort()).toEqual(
      jonyBackupCodes.map(hashTwoFactorAuthenticationRecoveryCode).sort(),
    );
  });

  it('signs in once with a backup code and keeps the authenticator and other sessions', async () => {
    const [backupCode] = jonyBackupCodes;
    const resetSessionCountBefore = await countResetSessions();

    const { data, errors } = await signInWithCode(backupCode.toLowerCase());

    expect(errors).toBeUndefined();

    const redemption =
      data.getAuthTokensFromTwoFactorAuthenticationRecoveryCode;

    expect(
      redemption.tokens?.accessOrWorkspaceAgnosticToken.token,
    ).toBeDefined();
    expect(redemption.provisioningUri).toBeNull();
    expect(redemption.isTwoFactorAuthenticationReset).toBe(false);

    const methodRows: { status: string }[] = await global.testDataSource.query(
      `SELECT "status" FROM core."twoFactorAuthenticationMethod" WHERE "userWorkspaceId" = $1`,
      [USER_WORKSPACE_DATA_SEED_IDS.JONY],
    );

    expect(methodRows).toEqual([{ status: 'VERIFIED' }]);

    expect(await countResetSessions()).toBe(resetSessionCountBefore);
    expect(await getRemainingBackupCodeCount()).toBe(9);

    const { errors: replayErrors } = await signInWithCode(backupCode);

    expect(replayErrors?.[0]?.extensions?.subCode).toBe(
      'INVALID_RECOVERY_CODE',
    );
  });

  it('requires a fresh authenticator code to generate new codes, which replace the old ones', async () => {
    const { errors: withoutOtpErrors } =
      await generateTwoFactorAuthenticationBackupCodes({
        accessToken: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        expectToFail: true,
      });

    expect(withoutOtpErrors?.[0]?.extensions?.subCode).toBe(
      'STEP_UP_AUTHENTICATION_REQUIRED',
    );

    const { data, errors } = await generateTwoFactorAuthenticationBackupCodes({
      otp: await generateOtp(jonySecret),
      accessToken: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const newBackupCodes =
      data.generateTwoFactorAuthenticationBackupCodes.backupCodes;

    expect(newBackupCodes).toHaveLength(10);
    expect(await getRemainingBackupCodeCount()).toBe(10);

    const { errors: oldCodeErrors } = await signInWithCode(jonyBackupCodes[1]);

    expect(oldCodeErrors?.[0]?.extensions?.subCode).toBe(
      'INVALID_RECOVERY_CODE',
    );

    const { errors: newCodeErrors } = await signInWithCode(newBackupCodes[0]);

    expect(newCodeErrors).toBeUndefined();

    jonyBackupCodes = newBackupCodes.slice(1);
  });

  it('revokes the backup codes when the authenticator is removed', async () => {
    const [{ id: twoFactorAuthenticationMethodId }] =
      await global.testDataSource.query(
        `SELECT "id" FROM core."twoFactorAuthenticationMethod" WHERE "userWorkspaceId" = $1`,
        [USER_WORKSPACE_DATA_SEED_IDS.JONY],
      );

    await deleteTwoFactorAuthenticationMethod({
      input: { twoFactorAuthenticationMethodId },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(await getRemainingBackupCodeCount()).toBe(0);

    const { secret, backupCodes } = await enrollJonyAuthenticator();

    jonySecret = secret;

    expect(backupCodes).toHaveLength(10);

    const { errors } = await signInWithCode(jonyBackupCodes[0]);

    expect(errors?.[0]?.extensions?.subCode).toBe('INVALID_RECOVERY_CODE');
  });

  it('only accepts codes issued for the current authenticator, even if they were never revoked', async () => {
    const { data: backupCodesData } =
      await generateTwoFactorAuthenticationBackupCodes({
        otp: await generateOtp(jonySecret),
        accessToken: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        expectToFail: false,
      });

    const previousAuthenticatorBackupCodes: string[] =
      backupCodesData.generateTwoFactorAuthenticationBackupCodes.backupCodes;

    const [{ id: previousTwoFactorAuthenticationMethodId }] =
      await global.testDataSource.query(
        `SELECT "id" FROM core."twoFactorAuthenticationMethod" WHERE "userWorkspaceId" = $1`,
        [USER_WORKSPACE_DATA_SEED_IDS.JONY],
      );

    await deleteTwoFactorAuthenticationMethod({
      input: {
        twoFactorAuthenticationMethodId:
          previousTwoFactorAuthenticationMethodId,
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    const { secret } = await enrollJonyAuthenticator();

    jonySecret = secret;

    await global.testDataSource.query(
      `UPDATE core."appToken" SET "revokedAt" = NULL WHERE "type" = $1 AND "userId" = $2 AND "value" = ANY($3)`,
      [
        AppTokenType.TwoFactorAuthenticationBackupCode,
        USER_DATA_SEED_IDS.JONY,
        previousAuthenticatorBackupCodes.map(
          hashTwoFactorAuthenticationRecoveryCode,
        ),
      ],
    );

    expect(await getRemainingBackupCodeCount()).toBe(10);

    const { errors } = await signInWithCode(
      previousAuthenticatorBackupCodes[0],
    );

    expect(errors?.[0]?.extensions?.subCode).toBe('INVALID_RECOVERY_CODE');
  });

  it('revokes the backup codes when a recovery code resets two-factor authentication', async () => {
    const { data: backupCodesData } =
      await generateTwoFactorAuthenticationBackupCodes({
        otp: await generateOtp(jonySecret),
        accessToken: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        expectToFail: false,
      });

    const [backupCode] =
      backupCodesData.generateTwoFactorAuthenticationBackupCodes.backupCodes;
    const recoveryCode = 'ABCDE-FGHJK-MNPQR-STVWX';

    await insertJonyRecoveryCode(recoveryCode);

    const { data, errors } = await signInWithCode(recoveryCode);

    expect(errors).toBeUndefined();
    expect(
      data.getAuthTokensFromTwoFactorAuthenticationRecoveryCode
        .isTwoFactorAuthenticationReset,
    ).toBe(true);
    expect(await getRemainingBackupCodeCount()).toBe(0);

    const { errors: backupCodeErrors } = await signInWithCode(backupCode);

    expect(backupCodeErrors?.[0]?.extensions?.subCode).toBe(
      'INVALID_RECOVERY_CODE',
    );
  });
});
