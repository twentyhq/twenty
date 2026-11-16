import { randomUUID } from 'node:crypto';

import { currentUser } from 'test/integration/graphql/suites/user-session/utils/current-user.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { impersonate } from 'test/integration/graphql/utils/impersonate.util';
import { signUpInWorkspaceAndGetAccessToken } from 'test/integration/graphql/utils/sign-up-in-workspace-and-get-access-token.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export type ImpersonatedAdminMember = {
  email: string;
  userId: string;
  workspaceMemberId: string;
  standardAccessToken: string;
  impersonationAccessToken: string;
};

// The member holds the admin role so that no permission flag stands between
// a session and the endpoint: what differs between the two tokens is only
// whether the session is impersonated.
export const createImpersonatedAdminMember =
  async (): Promise<ImpersonatedAdminMember> => {
    const email = `impersonated-${randomUUID()}@example.com`;

    const standardAccessToken = await signUpInWorkspaceAndGetAccessToken(email);

    const { data: currentUserData } = await currentUser({
      gqlFields: 'id workspaceMember { id }',
      token: standardAccessToken,
      expectToFail: false,
    });

    const userId = currentUserData.currentUser.id;
    const workspaceMemberId = currentUserData.currentUser.workspaceMember?.id;

    jestExpectToBeDefined(workspaceMemberId);

    const adminRole = await findOneRoleByLabel({ label: 'Admin' });

    await updateWorkspaceMemberRole({
      input: { workspaceMemberId, roleId: adminRole.id },
      expectToFail: false,
    });

    const { data: impersonateData } = await impersonate({
      userId,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    const { data: tokensData } = await getAuthTokensFromLoginToken({
      loginToken: impersonateData.impersonate.loginToken.token,
      origin: impersonateData.impersonate.workspace.workspaceUrls.subdomainUrl,
      expectToFail: false,
    });

    return {
      email,
      userId,
      workspaceMemberId,
      standardAccessToken,
      impersonationAccessToken:
        tokensData.getAuthTokensFromLoginToken.tokens
          .accessOrWorkspaceAgnosticToken.token,
    };
  };
