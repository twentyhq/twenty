import { clearInvitationSendingThrottle } from 'test/integration/graphql/utils/clear-invitation-sending-throttle.util';
import { findCurrentWorkspaceInviteHash } from 'test/integration/graphql/utils/find-current-workspace-invite-hash.util';
import { deleteWorkspaceInvitationsByEmail } from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { setWorkspaceActivationStatus } from 'test/integration/graphql/utils/set-workspace-activation-status.util';
import { updateWorkspace } from 'test/integration/graphql/utils/update-workspace.util';
import { sendInvitations } from 'test/integration/graphql/suites/user-session/utils/send-invitations.util';
import { deleteOneSsoIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/delete-one-sso-identity-provider.util';
import { SSO_TEST_PROTOCOLS } from 'test/integration/sso/constants/sso-test-protocols.constant';
import { deleteSsoUser } from 'test/integration/sso/utils/delete-sso-user.util';
import { exchangeLoginToken } from 'test/integration/sso/utils/exchange-login-token.util';
import { expectSsoErrorRedirect } from 'test/integration/sso/utils/expect-sso-error-redirect.util';
import { getSsoTestIdentityProvider } from 'test/integration/sso/utils/get-sso-test-identity-provider.util';
import { getYcombinatorAdminAccessToken } from 'test/integration/sso/utils/get-ycombinator-admin-access-token.util';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const APPLE_SUBDOMAIN = 'apple';
const YCOMBINATOR_SUBDOMAIN = 'yc';

describe('SSO sign-up should fail', () => {
  const testIdentityProvider = getSsoTestIdentityProvider();
  const newcomerEmail = testIdentityProvider.newcomer.username;
  let ycombinatorAdminAccessToken: string;

  beforeAll(async () => {
    ycombinatorAdminAccessToken = await getYcombinatorAdminAccessToken();
  });

  describe.each(SSO_TEST_PROTOCOLS)(
    '$protocol',
    ({ createTestIdentityProvider, signIn }) => {
      let appleIdentityProviderId: string | undefined;
      let ycombinatorIdentityProviderId: string | undefined;
      let isYcombinatorSuspended = false;
      let isPublicInviteLinkDisabled = false;
      let redirectUrl: URL | undefined;

      const signUpAsNewcomer = async ({
        identityProviderId,
        workspaceInviteHash,
      }: {
        identityProviderId: string;
        workspaceInviteHash?: string;
      }) => {
        redirectUrl = await signIn({
          identityProviderId,
          workspaceInviteHash,
          username: testIdentityProvider.newcomer.username,
          password: testIdentityProvider.newcomer.password,
        });

        return redirectUrl;
      };

      afterEach(async () => {
        if (isYcombinatorSuspended) {
          await setWorkspaceActivationStatus({
            workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
            activationStatus: WorkspaceActivationStatus.ACTIVE,
          });
          isYcombinatorSuspended = false;
        }

        if (isDefined(ycombinatorIdentityProviderId)) {
          await deleteOneSsoIdentityProvider({
            identityProviderId: ycombinatorIdentityProviderId,
            token: ycombinatorAdminAccessToken,
            expectToFail: false,
          });
          ycombinatorIdentityProviderId = undefined;
        }

        if (isDefined(appleIdentityProviderId)) {
          await deleteOneSsoIdentityProvider({
            identityProviderId: appleIdentityProviderId,
            expectToFail: false,
          });
          appleIdentityProviderId = undefined;
        }

        if (isPublicInviteLinkDisabled) {
          await updateWorkspace({
            data: { isPublicInviteLinkEnabled: true },
            expectToFail: false,
          });
          isPublicInviteLinkDisabled = false;
        }

        await clearInvitationSendingThrottle({ email: newcomerEmail });

        await deleteWorkspaceInvitationsByEmail({
          email: newcomerEmail,
          workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
        });

        // A case that wrongly let the newcomer in would leave them behind
        const accessToken = isDefined(redirectUrl)
          ? await exchangeLoginToken(redirectUrl)
          : undefined;

        if (isDefined(accessToken)) {
          await deleteSsoUser({ accessToken });
        }

        redirectUrl = undefined;
      });

      it('when the newcomer has no invitation', async () => {
        appleIdentityProviderId = await createTestIdentityProvider();

        expectSsoErrorRedirect({
          redirectUrl: await signUpAsNewcomer({
            identityProviderId: appleIdentityProviderId,
          }),
          workspaceSubdomain: APPLE_SUBDOMAIN,
          errorMessage: 'User does not have access to this workspace',
        });
      });

      it('when the public invite link is disabled', async () => {
        appleIdentityProviderId = await createTestIdentityProvider();

        const { data } = await findCurrentWorkspaceInviteHash({});
        const inviteHash = data.currentWorkspace.inviteHash;

        assertIsDefinedOrThrow(inviteHash);

        await updateWorkspace({
          data: { isPublicInviteLinkEnabled: false },
          expectToFail: false,
        });
        isPublicInviteLinkDisabled = true;

        expectSsoErrorRedirect({
          redirectUrl: await signUpAsNewcomer({
            identityProviderId: appleIdentityProviderId,
            workspaceInviteHash: inviteHash,
          }),
          workspaceSubdomain: APPLE_SUBDOMAIN,
          errorMessage: 'Public invite link is disabled for this workspace',
        });
      });

      it('when the workspace is suspended, even with a personal invitation', async () => {
        ycombinatorIdentityProviderId = await createTestIdentityProvider({
          token: ycombinatorAdminAccessToken,
        });

        await sendInvitations({
          input: { emails: [newcomerEmail] },
          expectToFail: false,
          token: ycombinatorAdminAccessToken,
        });

        await setWorkspaceActivationStatus({
          workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
          activationStatus: WorkspaceActivationStatus.SUSPENDED,
        });
        isYcombinatorSuspended = true;

        expectSsoErrorRedirect({
          redirectUrl: await signUpAsNewcomer({
            identityProviderId: ycombinatorIdentityProviderId,
          }),
          workspaceSubdomain: YCOMBINATOR_SUBDOMAIN,
          errorMessage: 'Workspace is not ready to welcome new members',
        });
      });
    },
  );
});
