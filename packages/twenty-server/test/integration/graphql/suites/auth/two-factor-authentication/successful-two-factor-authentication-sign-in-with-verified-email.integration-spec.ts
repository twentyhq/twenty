import { randomUUID } from 'node:crypto';

import { buildAppleWorkspaceOrigin } from 'test/integration/graphql/utils/build-apple-workspace-origin.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { enrollTwoFactorAuthenticationAuthenticator } from 'test/integration/graphql/utils/enroll-two-factor-authentication-authenticator.util';
import { generateTwoFactorAuthenticationOtp } from 'test/integration/graphql/utils/generate-two-factor-authentication-otp.util';
import { getAuthTokensFromOtp } from 'test/integration/graphql/utils/get-auth-tokens-from-otp.util';
import { getAuthTokensFromTwoFactorAuthenticationRecoveryCode } from 'test/integration/graphql/utils/get-auth-tokens-from-two-factor-authentication-recovery-code.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { getLoginTokenFromCredentials } from 'test/integration/graphql/utils/get-login-token-from-credentials.util';
import { initiateOtpProvisioning } from 'test/integration/graphql/utils/initiate-otp-provisioning.util';
import { setEmailVerificationRequired } from 'test/integration/graphql/utils/set-email-verification-required.util';
import { signUpInWorkspaceAndGetAccessToken } from 'test/integration/graphql/utils/sign-up-in-workspace-and-get-access-token.util';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

const PASSWORD = 'Verified-member-1';

describe('Two-factor authentication sign-in with a verified email should succeed', () => {
  let memberEmail: string;
  let memberAccessToken: string;

  const getMemberLoginToken = async () => {
    const { data } = await getLoginTokenFromCredentials({
      input: {
        email: memberEmail,
        password: PASSWORD,
        origin: buildAppleWorkspaceOrigin(),
      },
      expectToFail: false,
    });

    return data.getLoginTokenFromCredentials.loginToken.token;
  };

  const expectAccessTokenToBelongToMember = async (accessToken: string) => {
    const { data } = await getCurrentUser({ accessToken, expectToFail: false });

    expect(data.currentUser.email).toBe(memberEmail);
  };

  beforeAll(() => setEmailVerificationRequired(true));

  afterAll(() => setEmailVerificationRequired(false));

  beforeEach(async () => {
    memberEmail = `verified-member-${randomUUID()}@example.com`;
    memberAccessToken = await signUpInWorkspaceAndGetAccessToken(
      memberEmail,
      PASSWORD,
    );
  });

  afterEach(() =>
    deleteUser({ accessToken: memberAccessToken, expectToFail: false }),
  );

  it('should provision an authenticator from a login token and sign in with its OTP', async () => {
    const loginToken = await getMemberLoginToken();

    const { data: provisioningData } = await initiateOtpProvisioning({
      loginToken,
      origin: buildAppleWorkspaceOrigin(),
      expectToFail: false,
    });

    const { data } = await getAuthTokensFromOtp({
      loginToken,
      otp: await generateTwoFactorAuthenticationOtp({
        provisioningUri: provisioningData.initiateOTPProvisioning.uri,
      }),
      origin: buildAppleWorkspaceOrigin(),
      expectToFail: false,
    });

    await expectAccessTokenToBelongToMember(
      data.getAuthTokensFromOTP.tokens.accessOrWorkspaceAgnosticToken.token,
    );
  });

  it('should sign in with the OTP of an enrolled authenticator', async () => {
    const { provisioningUri } =
      await enrollTwoFactorAuthenticationAuthenticator({
        accessToken: memberAccessToken,
      });

    const { data } = await getAuthTokensFromOtp({
      loginToken: await getMemberLoginToken(),
      otp: await generateTwoFactorAuthenticationOtp({ provisioningUri }),
      origin: buildAppleWorkspaceOrigin(),
      expectToFail: false,
    });

    await expectAccessTokenToBelongToMember(
      data.getAuthTokensFromOTP.tokens.accessOrWorkspaceAgnosticToken.token,
    );
  });

  it('should sign in with a backup code', async () => {
    const { backupCodes } = await enrollTwoFactorAuthenticationAuthenticator({
      accessToken: memberAccessToken,
    });

    const { data } = await getAuthTokensFromTwoFactorAuthenticationRecoveryCode(
      {
        loginToken: await getMemberLoginToken(),
        recoveryCode: backupCodes[0],
        origin: buildAppleWorkspaceOrigin(),
        expectToFail: false,
      },
    );

    const { tokens } =
      data.getAuthTokensFromTwoFactorAuthenticationRecoveryCode;

    assertIsDefinedOrThrow(tokens);

    await expectAccessTokenToBelongToMember(
      tokens.accessOrWorkspaceAgnosticToken.token,
    );
  });
});
