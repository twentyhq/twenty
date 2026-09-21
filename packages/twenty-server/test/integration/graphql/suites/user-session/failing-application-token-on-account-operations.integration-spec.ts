import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { enrichWorkspaceCompany } from 'test/integration/graphql/suites/user-session/utils/enrich-workspace-company.util';
import { enterpriseSubscriptionStatus } from 'test/integration/graphql/suites/user-session/utils/enterprise-subscription-status.util';
import { getAiProviders } from 'test/integration/graphql/suites/user-session/utils/get-ai-providers.util';
import { getInviteSuggestions } from 'test/integration/graphql/suites/user-session/utils/get-invite-suggestions.util';
import { getTimelineThreadsFromPersonId } from 'test/integration/graphql/suites/user-session/utils/get-timeline-threads-from-person-id.util';
import { isMaintenanceModeBannerDismissed } from 'test/integration/graphql/suites/user-session/utils/is-maintenance-mode-banner-dismissed.util';
import { stopImpersonation } from 'test/integration/graphql/suites/user-session/utils/stop-impersonation.util';
import { currentUserApplicationAuthorizations } from 'test/integration/graphql/suites/user-session/utils/current-user-application-authorizations.util';
import { deleteUserFromWorkspace } from 'test/integration/graphql/suites/user-session/utils/delete-user-from-workspace.util';
import { currentUserSessions } from 'test/integration/graphql/suites/user-session/utils/current-user-sessions.util';
import { currentUser } from 'test/integration/graphql/suites/user-session/utils/current-user.util';
import { deleteTwoFactorAuthenticationMethod } from 'test/integration/graphql/suites/user-session/utils/delete-two-factor-authentication-method.util';
import { generateTransientToken } from 'test/integration/graphql/suites/user-session/utils/generate-transient-token.util';
import { authorizeApp } from 'test/integration/graphql/suites/user-session/utils/authorize-app.util';
import { revokeAllOtherUserSessions } from 'test/integration/graphql/suites/user-session/utils/revoke-all-other-user-sessions.util';
import { revokeApplicationAuthorization } from 'test/integration/graphql/suites/user-session/utils/revoke-application-authorization.util';
import { revokeUserSession } from 'test/integration/graphql/suites/user-session/utils/revoke-user-session.util';
import { updateUserEmail } from 'test/integration/graphql/suites/user-session/utils/update-user-email.util';
import { versionInfo } from 'test/integration/graphql/suites/user-session/utils/version-info.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { getAccessTokenForCredentials } from 'test/integration/graphql/utils/get-access-token-for-credentials.util';
import { impersonate } from 'test/integration/graphql/utils/impersonate.util';
import { activateWorkspace } from 'test/integration/graphql/utils/activate-workspace.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { initiateOtpProvisioningForAuthenticatedUser } from 'test/integration/graphql/utils/initiate-otp-provisioning-for-authenticated-user.util';
import { verifyTwoFactorAuthenticationMethod } from 'test/integration/graphql/utils/verify-two-factor-authentication-method.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { IsNull } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { v4 as uuidv4 } from 'uuid';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { UserSessionEntity } from 'src/engine/core-modules/user-session/user-session.entity';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

type GlobalTestContext = {
  application: ApplicationWithVariable;
  userBoundToken: string;
  unboundToken: string;
  liveSessionId: string;
};

type TestContext = {
  token: (globalContext: GlobalTestContext) => string;
};

const applicationTokenTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'with an application token bound to the admin',
    context: { token: (globalContext) => globalContext.userBoundToken },
  },
  {
    title: 'with an application token bound to nobody',
    context: { token: (globalContext) => globalContext.unboundToken },
  },
];

const countAuthorizationCodes = () =>
  getCoreRepository<AppTokenEntity>(AppTokenEntity).count({
    where: {
      userId: USER_DATA_SEED_IDS.JANE,
      type: AppTokenType.AuthorizationCode,
    },
  });

// Scoped to Jony: a count over every row would also move when another suite
// signs in or the expiry sweeper runs.
const countLiveSessions = () =>
  getCoreRepository<UserSessionEntity>(UserSessionEntity).count({
    where: { userId: USER_DATA_SEED_IDS.JONY, revokedAt: IsNull() },
  });

const countAdminWorkspaces = () =>
  getCoreRepository<UserWorkspaceEntity>(UserWorkspaceEntity).count({
    where: { userId: USER_DATA_SEED_IDS.JANE },
  });

const findSession = (id: string) =>
  getCoreRepository<UserSessionEntity>(UserSessionEntity).findOne({
    where: { id },
  });

describe('Account operations with an application token should fail', () => {
  let globalTestContext: GlobalTestContext;

  beforeAll(async () => {
    // The seeded tokens are signed offline, so no session row exists until
    // someone signs in; Jony has no seeded second factor to answer.
    await getAccessTokenForCredentials({ email: 'jony.ive@apple.dev' });

    const [liveSession] = await getCoreRepository<UserSessionEntity>(
      UserSessionEntity,
    ).find({
      where: { userId: USER_DATA_SEED_IDS.JONY, revokedAt: IsNull() },
    });

    if (!isDefined(liveSession)) {
      throw new Error('Expected the sign-in to have created a session row');
    }

    const application = await setupApplicationWithVariable({
      name: 'User Session Probe',
      variableKey: 'USER_SESSION_PROBE',
    });

    const [userBoundTokenPair, unboundTokenPair] = await Promise.all([
      generateAppleAdminApplicationTokenPair({ applicationId: application.id }),
      generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: application.id,
      }),
    ]);

    globalTestContext = {
      application,
      liveSessionId: liveSession.id,
      userBoundToken: userBoundTokenPair.applicationAccessToken.token,
      unboundToken: unboundTokenPair.applicationAccessToken.token,
    };
  }, 120000);

  afterAll(async () => {
    if (!isDefined(globalTestContext)) {
      return;
    }

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        globalTestContext.application.universalIdentifier,
    });
  });

  describe.each(eachTestingContextFilter(applicationTokenTestCases))(
    '$title',
    ({ context }) => {
      it('should refuse to delete the account, which still exists', async () => {
        const { errors } = await deleteUser({
          accessToken: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });

        const user = await getCoreRepository<UserEntity>(UserEntity).findOne({
          where: { id: USER_DATA_SEED_IDS.JANE },
        });

        expect(user?.deletedAt).toBeNull();
      });

      // Self-removal deletes the account when it is the last workspace, so an
      // application never does it, even bound to an admin whose role would
      // otherwise carry the member permission.
      it('should refuse to remove the bound member from the workspace', async () => {
        const membershipsBefore = await countAdminWorkspaces();

        const { errors } = await deleteUserFromWorkspace({
          input: {
            workspaceMemberIdToDelete: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          },
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });

        expect(await countAdminWorkspaces()).toBe(membershipsBefore);
      });

      it('should refuse to list the sessions', async () => {
        const { errors } = await currentUserSessions({
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('should refuse to revoke one session, which stays live', async () => {
        const { errors } = await revokeUserSession({
          input: { userSessionId: globalTestContext.liveSessionId },
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });

        const session = await findSession(globalTestContext.liveSessionId);

        expect(session?.revokedAt).toBeNull();
      });

      it('should refuse to revoke every other session, leaving the count unchanged', async () => {
        const liveSessionsBefore = await countLiveSessions();

        const { errors } = await revokeAllOtherUserSessions({
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });

        expect(await countLiveSessions()).toBe(liveSessionsBefore);
      });

      it('should refuse to start a two-factor provisioning', async () => {
        const { errors } = await initiateOtpProvisioningForAuthenticatedUser({
          accessToken: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('should refuse to verify a two-factor method', async () => {
        const { errors } = await verifyTwoFactorAuthenticationMethod({
          otp: '000000',
          accessToken: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('should refuse to delete a two-factor method', async () => {
        const { errors } = await deleteTwoFactorAuthenticationMethod({
          input: { twoFactorAuthenticationMethodId: uuidv4() },
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('should refuse to change the email, which is unchanged', async () => {
        const { errors } = await updateUserEmail({
          input: { newEmail: 'hijacked@twenty.test' },
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });

        const user = await getCoreRepository<UserEntity>(UserEntity).findOne({
          where: { id: USER_DATA_SEED_IDS.JANE },
        });

        expect(user?.email).not.toBe('hijacked@twenty.test');
      });

      it('should refuse to consent to an OAuth client, minting no authorization code', async () => {
        const authorizationCodesBefore = await countAuthorizationCodes();

        const { errors } = await authorizeApp({
          input: {
            clientId: uuidv4(),
            redirectUrl: 'https://app.twenty.test/callback',
            codeChallenge: 'a'.repeat(43),
          },
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });

        expect(await countAuthorizationCodes()).toBe(authorizationCodesBefore);
      });

      // signUpInNewWorkspace returns a loginToken, which the public
      // getAuthTokensFromLoginToken exchanges for a session access token: the
      // one path that would hand an application everything this guard refuses.
      it('should refuse to create a workspace, minting no login token', async () => {
        const workspacesBefore = await countAdminWorkspaces();

        const { errors } = await signUpInNewWorkspace({
          accessToken: context.token(globalTestContext),
          displayName: 'Escalated Workspace',
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });

        expect(await countAdminWorkspaces()).toBe(workspacesBefore);
      });

      // Activation is the step right after signUpInNewWorkspace, so guarding
      // only the first one would leave a workspace an application could finish.
      it('should refuse to activate the workspace', async () => {
        const { errors } = await activateWorkspace({
          accessToken: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });

        const workspace = await getCoreRepository<WorkspaceEntity>(
          WorkspaceEntity,
        ).findOne({ where: { id: SEED_APPLE_WORKSPACE_ID } });

        expect(workspace?.activationStatus).toBe(
          WorkspaceActivationStatus.ACTIVE,
        );
      });

      it('should refuse to mint a transient token', async () => {
        const { errors } = await generateTransientToken({
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('should refuse to impersonate a member', async () => {
        const { errors } = await impersonate({
          userId: USER_DATA_SEED_IDS.JONY,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          accessToken: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('should refuse to list the application authorizations', async () => {
        const { errors } = await currentUserApplicationAuthorizations({
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('should refuse to revoke an application authorization', async () => {
        const { errors } = await revokeApplicationAuthorization({
          input: { applicationAuthorizationId: uuidv4() },
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('should refuse an admin panel query', async () => {
        const { errors } = await versionInfo({
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      // One handler per resolver that carries the guard at class level: the
      // stack is shared, so the class is covered by any one of its handlers.
      it('should refuse an admin panel AI provider query', async () => {
        const { errors } = await getAiProviders({
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('should refuse an enterprise query', async () => {
        const { errors } = await enterpriseSubscriptionStatus({
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('should refuse an onboarding query', async () => {
        const { errors } = await getInviteSuggestions({
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('should refuse a company enrichment mutation', async () => {
        const { errors } = await enrichWorkspaceCompany({
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('should refuse a client config query', async () => {
        const { errors } = await isMaintenanceModeBannerDismissed({
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('should refuse a timeline messaging query', async () => {
        const { errors } = await getTimelineThreadsFromPersonId({
          input: { personId: uuidv4() },
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('should refuse to stop impersonation', async () => {
        const { errors } = await stopImpersonation({
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('should refuse currentUser selecting availableWorkspaces', async () => {
        const { errors } = await currentUser({
          gqlFields: `
            id
            availableWorkspaces {
              availableWorkspacesForSignIn {
                id
              }
            }
          `,
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('should refuse currentUser selecting workspaces', async () => {
        const { errors } = await currentUser({
          gqlFields: `
            id
            workspaces {
              id
            }
          `,
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      // Same rows as workspaces under the entity's own field name.
      it('should refuse currentUser selecting userWorkspaces', async () => {
        const { errors } = await currentUser({
          gqlFields: `
            id
            userWorkspaces {
              id
              userId
            }
          `,
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('should refuse currentUser selecting supportUserHash', async () => {
        const { errors } = await currentUser({
          gqlFields: `
            id
            supportUserHash
          `,
          token: context.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });
    },
  );
});
