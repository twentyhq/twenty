import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { impersonate } from 'test/integration/graphql/utils/impersonate.util';

import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

// Jane (authenticated in Apple) can impersonate across workspaces because she
// has the server-level canImpersonate capability and a seeded verified 2FA
// method. The target, Tim, is impersonated in the YCombinator workspace.
const SERVER_IMPERSONATOR_ACCESS_TOKEN = APPLE_JANE_ADMIN_ACCESS_TOKEN;

describe('Server-level impersonation - successful flow (integration)', () => {
  it('lets a server admin with verified 2FA impersonate a user in another workspace', async () => {
    const { data: impersonateData, errors: impersonateErrors } =
      await impersonate({
        userId: USER_DATA_SEED_IDS.TIM,
        workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
        accessToken: SERVER_IMPERSONATOR_ACCESS_TOKEN,
        expectToFail: false,
      });

    expect(impersonateErrors).toBeUndefined();

    const loginToken = impersonateData.impersonate.loginToken.token;
    const origin = impersonateData.impersonate.workspace.workspaceUrls
      .subdomainUrl as string;

    expect(loginToken).toBeDefined();
    expect(impersonateData.impersonate.workspace.id).toBe(
      SEED_YCOMBINATOR_WORKSPACE_ID,
    );

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
    expect(currentUserData.currentUser.id).toBe(USER_DATA_SEED_IDS.TIM);
  });
});
