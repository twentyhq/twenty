import { checkoutSession } from 'test/integration/graphql/suites/user-session/utils/checkout-session.util';
import { currentUserApplicationAuthorizations } from 'test/integration/graphql/suites/user-session/utils/current-user-application-authorizations.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { currentUserSessions } from 'test/integration/graphql/suites/user-session/utils/current-user-sessions.util';
import { currentUser } from 'test/integration/graphql/suites/user-session/utils/current-user.util';
import { generatePlaygroundToken } from 'test/integration/graphql/suites/user-session/utils/generate-playground-token.util';
import { generateTransientTokenResponse } from 'test/integration/utils/generate-transient-token.util';
import { sendInvitations } from 'test/integration/graphql/suites/user-session/utils/send-invitations.util';
import { versionInfo } from 'test/integration/graphql/suites/user-session/utils/version-info.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { getAccessTokenForCredentials } from 'test/integration/graphql/utils/get-access-token-for-credentials.util';
import { impersonate } from 'test/integration/graphql/utils/impersonate.util';
import { deleteWorkspaceInvitationsByEmail } from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { activateWorkspace } from 'test/integration/graphql/utils/activate-workspace.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { SystemPermissionFlag } from 'twenty-shared/constants';

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { TWO_FACTOR_AUTHENTICATION_METHOD_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-two-factor-authentication-methods.util';

// What the official applications with a settings component select on currentUser
// with the token they hold for the person who installed them.
const OFFICIAL_APPLICATION_CURRENT_USER_FIELDS = `
  firstName
  lastName
  email
  currentUserWorkspace {
    permissionFlags
  }
  workspaceMember {
    id
  }
`;

const USER_SESSION_REFUSAL_MESSAGE = 'This endpoint requires a user session';

describe('User session operations and application access that must keep working', () => {
  let applicationsApplication: ApplicationWithVariable;
  let workspaceMembersApplication: ApplicationWithVariable;
  let applicationsApplicationToken: string;
  let workspaceMembersApplicationToken: string;
  let memberSessionToken: string;

  beforeAll(async () => {
    // The seeded tokens are signed offline, so no session row exists until
    // someone signs in; Jony has no seeded second factor to answer.
    memberSessionToken = await getAccessTokenForCredentials({
      email: 'jony.ive@apple.dev',
    });

    // One at a time: each sync migrates workspace metadata and bumps its
    // version, which two concurrent syncs interleave.
    applicationsApplication = await setupApplicationWithVariable({
      name: 'User Session Reader',
      variableKey: 'USER_SESSION_READER',
    });
    workspaceMembersApplication = await setupApplicationWithVariable({
      name: 'User Session Inviter',
      variableKey: 'USER_SESSION_INVITER',
      permissionFlagUniversalIdentifiers: [
        SystemPermissionFlag.WORKSPACE_MEMBERS,
      ],
    });

    const [readerTokenPair, inviterTokenPair] = await Promise.all([
      generateAppleAdminApplicationTokenPair({
        applicationId: applicationsApplication.id,
      }),
      generateAppleAdminApplicationTokenPair({
        applicationId: workspaceMembersApplication.id,
      }),
    ]);

    applicationsApplicationToken = readerTokenPair.applicationAccessToken.token;
    workspaceMembersApplicationToken =
      inviterTokenPair.applicationAccessToken.token;
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        applicationsApplication.universalIdentifier,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        workspaceMembersApplication.universalIdentifier,
    });
  });

  describe('from the session', () => {
    it('should list the sessions', async () => {
      const { data, errors } = await currentUserSessions({
        token: memberSessionToken,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data.currentUserSessions.length).toBeGreaterThan(0);
    });

    it('should list the application authorizations', async () => {
      const { errors } = await currentUserApplicationAuthorizations({
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
    });

    it('should mint a transient token', async () => {
      const { data, errors } = await generateTransientTokenResponse({
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data.generateTransientToken.transientToken.token).toBeDefined();
    });

    it('should read the admin panel', async () => {
      const { errors } = await versionInfo({
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
    });

    it('should read the sensitive currentUser sub-fields', async () => {
      const { data, errors } = await currentUser({
        gqlFields: `
          id
          supportUserHash
          workspaces {
            id
          }
          availableWorkspaces {
            availableWorkspacesForSignIn {
              id
            }
          }
        `,
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data.currentUser.id).toBe(USER_DATA_SEED_IDS.JANE);
    });

    it('should read the two-factor summary the application token is denied', async () => {
      const { data, errors } = await currentUser({
        gqlFields: `
          id
          currentUserWorkspace {
            twoFactorAuthenticationMethodSummary {
              twoFactorAuthenticationMethodId
              status
              strategy
            }
          }
        `,
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(
        data.currentUser.currentUserWorkspace
          ?.twoFactorAuthenticationMethodSummary,
      ).toEqual([
        expect.objectContaining({
          twoFactorAuthenticationMethodId:
            TWO_FACTOR_AUTHENTICATION_METHOD_DATA_SEED_IDS.JANE,
          status: 'VERIFIED',
          strategy: 'TOTP',
        }),
      ]);
    });

    it('should impersonate a member', async () => {
      const { data, errors } = await impersonate({
        userId: USER_DATA_SEED_IDS.SCOTT,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data.impersonate.loginToken.token).toBeDefined();
    });

    it('should delete its own account', async () => {
      const email = `user-session-delete-${Date.now()}@example.com`;

      const { data: signUpData } = await signUp({
        input: { email, password: 'Applecar2025!' },
        expectToFail: false,
      });

      const { data, errors } = await deleteUser({
        accessToken:
          signUpData.signUp.tokens.accessOrWorkspaceAgnosticToken.token,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data.deleteUser.id).toBeDefined();
    });
  });

  describe('from a workspace-agnostic session', () => {
    it('should read currentUser and its own sessions', async () => {
      const email = `user-session-agnostic-${Date.now()}@example.com`;

      const { data: signUpData } = await signUp({
        input: { email, password: 'Applecar2025!' },
        expectToFail: false,
      });

      const workspaceAgnosticToken =
        signUpData.signUp.tokens.accessOrWorkspaceAgnosticToken.token;

      const { data: currentUserData, errors: currentUserErrors } =
        await currentUser({
          gqlFields: 'id email',
          token: workspaceAgnosticToken,
          expectToFail: false,
        });

      expect(currentUserErrors).toBeUndefined();
      expect(currentUserData.currentUser.email).toBe(email);

      const { errors: sessionsErrors } = await currentUserSessions({
        token: workspaceAgnosticToken,
        expectToFail: false,
      });

      expect(sessionsErrors).toBeUndefined();

      const { errors: authorizationsErrors } =
        await currentUserApplicationAuthorizations({
          token: workspaceAgnosticToken,
          expectToFail: false,
        });

      expect(authorizationsErrors).toBeUndefined();

      await deleteUser({
        accessToken: workspaceAgnosticToken,
        expectToFail: false,
      });
    });

    // The shape the front sends when someone creates a workspace from the
    // sign-up flow: guarding signUpInNewWorkspace and activateWorkspace must
    // not break it.
    it('should create and activate a new workspace', async () => {
      const email = `user-session-new-workspace-${Date.now()}@example.com`;

      const { data: signUpData } = await signUp({
        input: { email, password: 'Applecar2025!' },
        expectToFail: false,
      });

      const { data: newWorkspaceData, errors } = await signUpInNewWorkspace({
        accessToken:
          signUpData.signUp.tokens.accessOrWorkspaceAgnosticToken.token,
        displayName: 'User Session Workspace',
        expectToFail: false,
      });

      expect(errors).toBeUndefined();

      const { data: authTokensData } = await getAuthTokensFromLoginToken({
        loginToken: newWorkspaceData.signUpInNewWorkspace.loginToken.token,
        origin:
          newWorkspaceData.signUpInNewWorkspace.workspace.workspaceUrls
            .subdomainUrl,
        expectToFail: false,
      });

      const workspaceAccessToken =
        authTokensData.getAuthTokensFromLoginToken.tokens
          .accessOrWorkspaceAgnosticToken.token;

      const { errors: activateErrors } = await activateWorkspace({
        accessToken: workspaceAccessToken,
        expectToFail: false,
      });

      expect(activateErrors).toBeUndefined();

      await deleteUser({
        accessToken: workspaceAccessToken,
        expectToFail: false,
      });
    });
  });

  describe('from a playground token', () => {
    it('should read currentUser', async () => {
      const { data: playgroundTokenData } = await generatePlaygroundToken({
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        expectToFail: false,
      });

      const { data, errors } = await currentUser({
        gqlFields: 'id email',
        token: playgroundTokenData.generatePlaygroundToken.token,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data.currentUser.id).toBe(USER_DATA_SEED_IDS.JANE);
    });
  });

  describe('from an application token bound to the admin', () => {
    it('should read the currentUser fields the official applications select', async () => {
      const { data, errors } = await currentUser({
        gqlFields: OFFICIAL_APPLICATION_CURRENT_USER_FIELDS,
        token: applicationsApplicationToken,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data.currentUser.email).toBeDefined();
      expect(
        data.currentUser.currentUserWorkspace?.permissionFlags,
      ).toBeDefined();
    });

    it('should read currentUser without the two-factor summary', async () => {
      const { data, errors } = await currentUser({
        gqlFields: `
          id
          currentUserWorkspace {
            twoFactorAuthenticationMethodSummary {
              twoFactorAuthenticationMethodId
              status
              strategy
            }
          }
        `,
        token: applicationsApplicationToken,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(
        data.currentUser.currentUserWorkspace
          ?.twoFactorAuthenticationMethodSummary,
      ).toBeNull();
    });

    it('should send invitations when the application role holds the permission', async () => {
      const email = `user-session-invite-${Date.now()}@example.com`;

      try {
        const { data, errors } = await sendInvitations({
          input: { emails: [email] },
          token: workspaceMembersApplicationToken,
          expectToFail: false,
        });

        expect(errors).toBeUndefined();
        expect(data.sendInvitations.success).toBe(true);
      } finally {
        await deleteWorkspaceInvitationsByEmail({ email });
      }
    });

    // Billing is off in the integration environment, so the mutation cannot
    // complete; what this asserts is that the user-session guard is not what
    // stopped it, leaving checkoutSession on its permission path.
    it('should reach the checkout session permission path', async () => {
      const { errors } = await checkoutSession({
        input: { recurringInterval: SubscriptionInterval.Month },
        token: workspaceMembersApplicationToken,
        expectToFail: null,
      });

      expect((errors ?? []).map(({ message }) => message)).not.toContain(
        USER_SESSION_REFUSAL_MESSAGE,
      );
    });
  });
});
