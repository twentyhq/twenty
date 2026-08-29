import { authenticator } from 'otplib';
import { initiateOtpProvisioningForAuthenticatedUser } from 'test/integration/graphql/utils/initiate-otp-provisioning-for-authenticated-user.util';
import { verifyTwoFactorAuthenticationMethod } from 'test/integration/graphql/utils/verify-two-factor-authentication-method.util';

import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const TOTP_STEP_DURATION_MS = 30_000;
const MINIMUM_STEP_REMAINING_MS = 5_000;

const generateTokenAtEpoch = (secret: string, epochMs: number): string =>
  authenticator.clone({ epoch: epochMs }).generate(secret);

// A previous-step token generated right before a step boundary would already be
// two steps old once the server validates it, so wait out the boundary first
const waitUntilSafelyInsideTotpStep = async (): Promise<void> => {
  const millisecondsRemainingInStep =
    TOTP_STEP_DURATION_MS - (Date.now() % TOTP_STEP_DURATION_MS);

  if (millisecondsRemainingInStep < MINIMUM_STEP_REMAINING_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, millisecondsRemainingInStep + 100),
    );
  }
};

const deleteJonyTwoFactorAuthenticationMethods = async (): Promise<void> => {
  await global.testDataSource.query(
    `DELETE FROM core."twoFactorAuthenticationMethod" WHERE "userWorkspaceId" = $1`,
    [USER_WORKSPACE_DATA_SEED_IDS.JONY],
  );
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

  afterAll(async () => {
    await deleteJonyTwoFactorAuthenticationMethods();
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
});
