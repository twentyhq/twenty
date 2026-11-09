import { createApprovedAccessDomain } from 'test/integration/graphql/utils/create-approved-access-domain.util';
import { deleteApprovedAccessDomain } from 'test/integration/graphql/utils/delete-approved-access-domain.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { findCurrentWorkspaceInviteHash } from 'test/integration/graphql/utils/find-current-workspace-invite-hash.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { deleteWorkspaceInvitationsByEmail } from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { sendInvitations } from 'test/integration/graphql/suites/user-session/utils/send-invitations.util';
import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { findMyConnectedAccounts } from 'test/integration/metadata/suites/connected-account/utils/find-my-connected-accounts.util';
import { deleteOneSsoIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/delete-one-sso-identity-provider.util';
import { createTestOidcIdentityProvider } from 'test/integration/sso/utils/create-test-oidc-identity-provider.util';
import { getSsoTestIdentityProvider } from 'test/integration/sso/utils/get-sso-test-identity-provider.util';
import { signInWithOidc } from 'test/integration/sso/utils/sign-in-with-oidc.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getDomainFromEmailOrThrow } from 'src/utils/get-domain-from-email-or-throw';

const exchangeLoginToken = async (verifyUrl: URL) => {
  const loginToken = verifyUrl.searchParams.get('loginToken');

  if (!isDefined(loginToken)) {
    return undefined;
  }

  const { data } = await getAuthTokensFromLoginToken({
    loginToken,
    origin: verifyUrl.origin,
    expectToFail: false,
  });

  return data.getAuthTokensFromLoginToken.tokens.accessOrWorkspaceAgnosticToken
    .token;
};

const setEmailVerificationRequired = (value: boolean) =>
  updateConfigVariable({
    input: { key: 'IS_EMAIL_VERIFICATION_REQUIRED', value },
  });

describe('SSO sign-up should succeed', () => {
  const testIdentityProvider = getSsoTestIdentityProvider();
  const newcomerEmail = testIdentityProvider.newcomer.username;
  let identityProviderId: string;
  let newcomerAccessToken: string | undefined;
  let approvedAccessDomainId: string | undefined;
  let isEmailVerificationRequired = false;

  const signInAsNewcomer = (workspaceInviteHash?: string) =>
    signInWithOidc({
      identityProviderId,
      workspaceInviteHash,
      username: testIdentityProvider.newcomer.username,
      password: testIdentityProvider.newcomer.password,
    });

  const signUpAsNewcomer = async (workspaceInviteHash?: string) => {
    const verifyUrl = await signInAsNewcomer(workspaceInviteHash);

    expect(verifyUrl.searchParams.get('errorMessage')).toBeNull();

    newcomerAccessToken = await exchangeLoginToken(verifyUrl);

    assertIsDefinedOrThrow(newcomerAccessToken);

    const { data } = await getCurrentUser({
      accessToken: newcomerAccessToken,
      expectToFail: false,
    });

    return data.currentUser;
  };

  const expectNewcomerInApple = (
    currentUser: Awaited<ReturnType<typeof signUpAsNewcomer>>,
  ) =>
    expect(currentUser).toMatchObject({
      email: newcomerEmail,
      firstName: 'Sso',
      lastName: 'Newcomer',
      isEmailVerified: true,
      currentWorkspace: { id: SEED_APPLE_WORKSPACE_ID },
    });

  beforeAll(async () => {
    identityProviderId = await createTestOidcIdentityProvider();
  });

  afterEach(async () => {
    // A case that failed before its token exchange left no session to delete the newcomer with
    const accessToken =
      newcomerAccessToken ??
      (await exchangeLoginToken(await signInAsNewcomer()));

    if (isDefined(accessToken)) {
      // deleteUser hands the departing member's connected accounts to another member
      const newcomerSsoConnectedAccounts = (
        await findMyConnectedAccounts({ token: accessToken })
      ).filter(
        ({ provider, handle }) =>
          provider === 'oidc' && handle === newcomerEmail,
      );

      for (const { id } of newcomerSsoConnectedAccounts) {
        await deleteConnectedAccount({
          id,
          expectToFail: false,
          token: accessToken,
        });
      }

      await deleteUser({ accessToken, expectToFail: false });
    }

    newcomerAccessToken = undefined;

    if (isEmailVerificationRequired) {
      await setEmailVerificationRequired(false);
      isEmailVerificationRequired = false;
    }

    if (isDefined(approvedAccessDomainId)) {
      await deleteApprovedAccessDomain({
        input: { id: approvedAccessDomainId },
        expectToFail: false,
      });
      approvedAccessDomainId = undefined;
    }

    await deleteWorkspaceInvitationsByEmail({ email: newcomerEmail });
  });

  afterAll(async () => {
    await deleteOneSsoIdentityProvider({
      identityProviderId,
      expectToFail: false,
    });
  });

  describe('OIDC', () => {
    it('should sign a newcomer up through a personal invitation', async () => {
      await sendInvitations({
        input: { emails: [newcomerEmail] },
        expectToFail: false,
      });

      expectNewcomerInApple(await signUpAsNewcomer());
    });

    it('should sign a newcomer up through the public invite link', async () => {
      const { data } = await findCurrentWorkspaceInviteHash({});
      const inviteHash = data.currentWorkspace.inviteHash;

      assertIsDefinedOrThrow(inviteHash);

      expectNewcomerInApple(await signUpAsNewcomer(inviteHash));
    });

    it('should sign a newcomer up through an approved access domain', async () => {
      await setEmailVerificationRequired(true);
      isEmailVerificationRequired = true;

      const { data } = await createApprovedAccessDomain({
        input: {
          domain: getDomainFromEmailOrThrow(newcomerEmail),
          email: newcomerEmail,
        },
        expectToFail: false,
      });

      approvedAccessDomainId = data.createApprovedAccessDomain.id;

      // Validating needs the token Twenty emails, which integration tests can't read
      await globalThis.testDataSource.query(
        `UPDATE core."approvedAccessDomain" SET "isValidated" = true WHERE "id" = $1`,
        [approvedAccessDomainId],
      );

      expectNewcomerInApple(await signUpAsNewcomer());
    });
  });
});
