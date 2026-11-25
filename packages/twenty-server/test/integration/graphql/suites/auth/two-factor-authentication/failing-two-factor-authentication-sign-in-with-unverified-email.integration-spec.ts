import { randomUUID } from 'node:crypto';

import { buildAppleWorkspaceOrigin } from 'test/integration/graphql/utils/build-apple-workspace-origin.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { enrollTwoFactorAuthenticationAuthenticator } from 'test/integration/graphql/utils/enroll-two-factor-authentication-authenticator.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findCurrentWorkspaceInviteHash } from 'test/integration/graphql/utils/find-current-workspace-invite-hash.util';
import { generateTwoFactorAuthenticationOtp } from 'test/integration/graphql/utils/generate-two-factor-authentication-otp.util';
import { getAccessTokenForCredentials } from 'test/integration/graphql/utils/get-access-token-for-credentials.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getAuthTokensFromOtp } from 'test/integration/graphql/utils/get-auth-tokens-from-otp.util';
import { getAuthTokensFromTwoFactorAuthenticationRecoveryCode } from 'test/integration/graphql/utils/get-auth-tokens-from-two-factor-authentication-recovery-code.util';
import { initiateOtpProvisioning } from 'test/integration/graphql/utils/initiate-otp-provisioning.util';
import { setEmailVerificationRequired } from 'test/integration/graphql/utils/set-email-verification-required.util';
import { signUpInWorkspace } from 'test/integration/graphql/utils/sign-up-in-workspace.util';
import { updateWorkspace } from 'test/integration/graphql/utils/update-workspace.util';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const PASSWORD = 'Unverified-member-1';

describe('Two-factor authentication sign-in with an unverified email should fail', () => {
  let signUpLoginToken: string;
  let memberAccessToken: string;

  beforeEach(async () => {
    const email = `unverified-member-${randomUUID()}@example.com`;

    await updateWorkspace({
      data: { isPublicInviteLinkEnabled: true },
      expectToFail: false,
    });

    const { data: inviteHashData } = await findCurrentWorkspaceInviteHash({});
    const workspaceInviteHash = inviteHashData.currentWorkspace.inviteHash;

    assertIsDefinedOrThrow(workspaceInviteHash);

    await setEmailVerificationRequired(true);

    const { data: signUpData } = await signUpInWorkspace({
      input: {
        email,
        password: PASSWORD,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        workspaceInviteHash,
      },
      expectToFail: false,
    });

    signUpLoginToken = signUpData.signUpInWorkspace.loginToken.token;

    await setEmailVerificationRequired(false);

    memberAccessToken = await getAccessTokenForCredentials({
      email,
      password: PASSWORD,
    });
  });

  afterEach(async () => {
    await setEmailVerificationRequired(false);
    await deleteUser({ accessToken: memberAccessToken, expectToFail: false });
  });

  it('when the sign-up login token is exchanged', async () => {
    await setEmailVerificationRequired(true);

    const { errors } = await getAuthTokensFromLoginToken({
      loginToken: signUpLoginToken,
      origin: buildAppleWorkspaceOrigin(),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('when an authenticator is provisioned from the sign-up login token', async () => {
    await setEmailVerificationRequired(true);

    const { errors } = await initiateOtpProvisioning({
      loginToken: signUpLoginToken,
      origin: buildAppleWorkspaceOrigin(),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('when the sign-up login token is exchanged with the OTP of a pending authenticator', async () => {
    const { data: provisioningData } = await initiateOtpProvisioning({
      loginToken: signUpLoginToken,
      origin: buildAppleWorkspaceOrigin(),
      expectToFail: false,
    });

    await setEmailVerificationRequired(true);

    const { errors } = await getAuthTokensFromOtp({
      loginToken: signUpLoginToken,
      otp: await generateTwoFactorAuthenticationOtp({
        provisioningUri: provisioningData.initiateOTPProvisioning.uri,
      }),
      origin: buildAppleWorkspaceOrigin(),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('when the sign-up login token is exchanged with the OTP of an enrolled authenticator', async () => {
    const { provisioningUri } =
      await enrollTwoFactorAuthenticationAuthenticator({
        accessToken: memberAccessToken,
      });

    await setEmailVerificationRequired(true);

    const { errors } = await getAuthTokensFromOtp({
      loginToken: signUpLoginToken,
      otp: await generateTwoFactorAuthenticationOtp({ provisioningUri }),
      origin: buildAppleWorkspaceOrigin(),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('when the sign-up login token is exchanged with a backup code', async () => {
    const { backupCodes } = await enrollTwoFactorAuthenticationAuthenticator({
      accessToken: memberAccessToken,
    });

    await setEmailVerificationRequired(true);

    const { errors } =
      await getAuthTokensFromTwoFactorAuthenticationRecoveryCode({
        loginToken: signUpLoginToken,
        recoveryCode: backupCodes[0],
        origin: buildAppleWorkspaceOrigin(),
        expectToFail: true,
      });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
