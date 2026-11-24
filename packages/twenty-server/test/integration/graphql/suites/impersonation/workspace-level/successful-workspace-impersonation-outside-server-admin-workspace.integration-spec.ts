import { mockServerAdminWorkspaceId } from 'test/integration/graphql/suites/admin-panel/utils/mock-server-admin-workspace-id.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { impersonate } from 'test/integration/graphql/utils/impersonate.util';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

/* global APPLE_JANE_ADMIN_ACCESS_TOKEN */

describe('Workspace-level impersonation outside the server admin workspace', () => {
  beforeAll(() => {
    mockServerAdminWorkspaceId(SEED_YCOMBINATOR_WORKSPACE_ID);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should let a workspace admin impersonate a member and use the session', async () => {
    const { data: impersonateData, errors: impersonateErrors } =
      await impersonate({
        userId: USER_DATA_SEED_IDS.SCOTT,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        expectToFail: false,
      });

    expect(impersonateErrors).toBeUndefined();

    const { data: tokensData, errors: tokensErrors } =
      await getAuthTokensFromLoginToken({
        loginToken: impersonateData.impersonate.loginToken.token,
        origin:
          impersonateData.impersonate.workspace.workspaceUrls.subdomainUrl,
        expectToFail: false,
      });

    expect(tokensErrors).toBeUndefined();

    const { data: currentUserData, errors: currentUserErrors } =
      await getCurrentUser({
        accessToken:
          tokensData.getAuthTokensFromLoginToken.tokens
            .accessOrWorkspaceAgnosticToken.token,
        expectToFail: false,
      });

    expect(currentUserErrors).toBeUndefined();
    expect(currentUserData.currentUser.id).toBe(USER_DATA_SEED_IDS.SCOTT);
  });
});
