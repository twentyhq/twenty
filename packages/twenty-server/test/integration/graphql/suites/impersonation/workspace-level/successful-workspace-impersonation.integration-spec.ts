import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { impersonate } from 'test/integration/graphql/utils/impersonate.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

// Jane holds the Apple admin role (so she has the IMPERSONATE workspace
// permission) and Jony is a regular member. Both seed users carry admin
// privileges (canImpersonate / canAccessFullAdminPanel), so the admin-target
// guard lets Jane impersonate Jony at the workspace level.
const IMPERSONATOR_ACCESS_TOKEN = APPLE_JANE_ADMIN_ACCESS_TOKEN;

describe('Workspace-level impersonation - successful flow (integration)', () => {
  it('lets a workspace admin impersonate a member and obtain a usable access token', async () => {
    const { data: impersonateData, errors: impersonateErrors } =
      await impersonate({
        userId: USER_DATA_SEED_IDS.JONY,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        accessToken: IMPERSONATOR_ACCESS_TOKEN,
        expectToFail: false,
      });

    expect(impersonateErrors).toBeUndefined();

    const loginToken = impersonateData.impersonate.loginToken.token;
    const origin = impersonateData.impersonate.workspace.workspaceUrls
      .subdomainUrl as string;

    expect(loginToken).toBeDefined();

    const { data: tokensData, errors: tokensErrors } =
      await getAuthTokensFromLoginToken({
        loginToken,
        origin,
        expectToFail: false,
      });

    expect(tokensErrors).toBeUndefined();

    const impersonationAccessToken =
      tokensData.getAuthTokensFromLoginToken.tokens
        .accessOrWorkspaceAgnosticToken.token;

    expect(impersonationAccessToken).toBeDefined();

    const { data: currentUserData, errors: currentUserErrors } =
      await getCurrentUser({
        accessToken: impersonationAccessToken,
        expectToFail: false,
      });

    expect(currentUserErrors).toBeUndefined();
    expect(currentUserData.currentUser.id).toBe(USER_DATA_SEED_IDS.JONY);
  });
});
