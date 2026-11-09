import { clearInvitationSendingThrottle } from 'test/integration/graphql/utils/clear-invitation-sending-throttle.util';
import { createApprovedAccessDomain } from 'test/integration/graphql/utils/create-approved-access-domain.util';
import { deleteApprovedAccessDomain } from 'test/integration/graphql/utils/delete-approved-access-domain.util';
import { findCurrentWorkspaceInviteHash } from 'test/integration/graphql/utils/find-current-workspace-invite-hash.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { deleteWorkspaceInvitationsByEmail } from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { sendInvitations } from 'test/integration/graphql/suites/user-session/utils/send-invitations.util';
import { deleteOneSsoIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/delete-one-sso-identity-provider.util';
import { SSO_TEST_PROTOCOLS } from 'test/integration/sso/constants/sso-test-protocols.constant';
import { deleteSsoUser } from 'test/integration/sso/utils/delete-sso-user.util';
import { exchangeLoginToken } from 'test/integration/sso/utils/exchange-login-token.util';
import { getSsoTestIdentityProvider } from 'test/integration/sso/utils/get-sso-test-identity-provider.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getDomainFromEmailOrThrow } from 'src/utils/get-domain-from-email-or-throw';

// Twenty reads only the email from a SAML assertion
const NEWCOMER_NAMES_BY_PROTOCOL = {
  OIDC: { firstName: 'Sso', lastName: 'Newcomer' },
  SAML: { firstName: '', lastName: '' },
};

const setEmailVerificationRequired = (value: boolean) =>
  updateConfigVariable({
    input: { key: 'IS_EMAIL_VERIFICATION_REQUIRED', value },
  });

describe('SSO sign-up should succeed', () => {
  const testIdentityProvider = getSsoTestIdentityProvider();
  const newcomerEmail = testIdentityProvider.newcomer.username;

  describe.each(SSO_TEST_PROTOCOLS)(
    '$protocol',
    ({ protocol, createTestIdentityProvider, signIn }) => {
      let identityProviderId: string;
      let newcomerAccessToken: string | undefined;
      let approvedAccessDomainId: string | undefined;
      let isEmailVerificationRequired = false;

      const signInAsNewcomer = (workspaceInviteHash?: string) =>
        signIn({
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
          ...NEWCOMER_NAMES_BY_PROTOCOL[protocol],
          isEmailVerified: true,
          currentWorkspace: { id: SEED_APPLE_WORKSPACE_ID },
        });

      beforeAll(async () => {
        identityProviderId = await createTestIdentityProvider();
      });

      afterEach(async () => {
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

        await clearInvitationSendingThrottle({ email: newcomerEmail });

        await deleteWorkspaceInvitationsByEmail({ email: newcomerEmail });

        // Runs last so an unreachable identity provider can't skip the steps above
        const accessToken =
          newcomerAccessToken ??
          (await exchangeLoginToken(await signInAsNewcomer()));

        if (isDefined(accessToken)) {
          await deleteSsoUser({ accessToken });
        }

        newcomerAccessToken = undefined;
      });

      afterAll(async () => {
        await deleteOneSsoIdentityProvider({
          identityProviderId,
          expectToFail: false,
        });
      });

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
    },
  );
});
