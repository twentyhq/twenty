import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import {
  type ImpersonatedAdminMember,
  createImpersonatedAdminMember,
} from 'test/integration/graphql/suites/impersonation/utils/create-impersonated-admin-member.util';
import { currentUserApplicationAuthorizations } from 'test/integration/graphql/suites/user-session/utils/current-user-application-authorizations.util';
import { currentUser } from 'test/integration/graphql/suites/user-session/utils/current-user.util';
import { deleteUserFromWorkspace } from 'test/integration/graphql/suites/user-session/utils/delete-user-from-workspace.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { impersonate } from 'test/integration/graphql/utils/impersonate.util';
import { signUpInWorkspaceAndGetAccessToken } from 'test/integration/graphql/utils/sign-up-in-workspace-and-get-access-token.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const CURRENT_USER_MEMBERSHIP_FIELDS = `
  id
  currentUserWorkspace {
    id
    isImpersonating
  }
  workspaces {
    id
  }
  userWorkspaces {
    id
  }
  availableWorkspaces {
    availableWorkspacesForSignIn {
      id
      loginToken
    }
    availableWorkspacesForSignUp {
      id
      personalInviteToken
    }
  }
`;

const countUserWorkspaces = (userId: string) =>
  getCoreRepository<UserWorkspaceEntity>(UserWorkspaceEntity).count({
    where: { userId },
  });

describe('Impersonated session - operations inside the workspace (integration)', () => {
  // Jony is a member of both seeded workspaces
  describe('currentUser', () => {
    let impersonationAccessToken: string;

    beforeAll(async () => {
      const { data: impersonateData } = await impersonate({
        userId: USER_DATA_SEED_IDS.JONY,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        expectToFail: false,
      });

      const { data: tokensData } = await getAuthTokensFromLoginToken({
        loginToken: impersonateData.impersonate.loginToken.token,
        origin:
          impersonateData.impersonate.workspace.workspaceUrls.subdomainUrl,
        expectToFail: false,
      });

      impersonationAccessToken =
        tokensData.getAuthTokensFromLoginToken.tokens
          .accessOrWorkspaceAgnosticToken.token;
    });

    it('resolves while impersonating and exposes only the current workspace', async () => {
      const { data, errors } = await currentUser({
        gqlFields: CURRENT_USER_MEMBERSHIP_FIELDS,
        token: impersonationAccessToken,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data.currentUser).toMatchObject({
        id: USER_DATA_SEED_IDS.JONY,
        currentUserWorkspace: {
          id: USER_WORKSPACE_DATA_SEED_IDS.JONY,
          isImpersonating: true,
        },
        workspaces: [{ id: USER_WORKSPACE_DATA_SEED_IDS.JONY }],
        userWorkspaces: [{ id: USER_WORKSPACE_DATA_SEED_IDS.JONY }],
        availableWorkspaces: {
          availableWorkspacesForSignIn: [],
          availableWorkspacesForSignUp: [],
        },
      });
    });

    it('still lists every workspace for the standard session of the same user', async () => {
      const { data, errors } = await currentUser({
        gqlFields: CURRENT_USER_MEMBERSHIP_FIELDS,
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();

      const expectedUserWorkspaces = expect.arrayContaining([
        { id: USER_WORKSPACE_DATA_SEED_IDS.JONY },
        { id: USER_WORKSPACE_DATA_SEED_IDS.JONY_ACME },
      ]);

      expect(data.currentUser).toMatchObject({
        workspaces: expectedUserWorkspaces,
        userWorkspaces: expectedUserWorkspaces,
        availableWorkspaces: {
          availableWorkspacesForSignIn: expect.arrayContaining([
            expect.objectContaining({ id: SEED_APPLE_WORKSPACE_ID }),
            expect.objectContaining({ id: SEED_YCOMBINATOR_WORKSPACE_ID }),
          ]),
        },
      });
    });
  });

  describe('as an admin member', () => {
    let member: ImpersonatedAdminMember;

    beforeAll(async () => {
      member = await createImpersonatedAdminMember();
    }, 120000);

    afterAll(async () => {
      await deleteUserFromWorkspace({
        input: { workspaceMemberIdToDelete: member.workspaceMemberId },
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });
    });

    it('removes another member from the workspace', async () => {
      const otherMemberAccessToken = await signUpInWorkspaceAndGetAccessToken(
        `removed-${randomUUID()}@example.com`,
      );

      const { data: otherMemberData } = await currentUser({
        gqlFields: 'id workspaceMember { id }',
        token: otherMemberAccessToken,
        expectToFail: false,
      });

      const otherWorkspaceMemberId =
        otherMemberData.currentUser.workspaceMember?.id;

      jestExpectToBeDefined(otherWorkspaceMemberId);

      const { errors } = await deleteUserFromWorkspace({
        input: { workspaceMemberIdToDelete: otherWorkspaceMemberId },
        token: member.impersonationAccessToken,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(await countUserWorkspaces(otherMemberData.currentUser.id)).toBe(0);
    });

    // Each of these reads shares a resolver with a write refused while impersonating
    it('lists the connected accounts', async () => {
      const response = await makeMetadataApiRequest(
        {
          query: gql`
            query {
              myConnectedAccounts {
                id
              }
            }
          `,
        },
        member.impersonationAccessToken,
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.myConnectedAccounts).toEqual(expect.any(Array));
    });

    it('lists the application authorizations', async () => {
      const { data, errors } = await currentUserApplicationAuthorizations({
        token: member.impersonationAccessToken,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data.currentUserApplicationAuthorizations).toEqual([]);
    });

    it('reaches the IMAP, SMTP and CalDAV account lookup', async () => {
      const response = await makeMetadataApiRequest(
        {
          query: gql`
            query ($id: UUID!) {
              getConnectedImapSmtpCaldavAccount(id: $id) {
                id
              }
            }
          `,
          variables: { id: randomUUID() },
        },
        member.impersonationAccessToken,
      );

      expect(response.body.errors).toHaveLength(1);
      expect(response.body.errors[0].message).toBe(
        'Connected account not found',
      );
    });
  });
});
