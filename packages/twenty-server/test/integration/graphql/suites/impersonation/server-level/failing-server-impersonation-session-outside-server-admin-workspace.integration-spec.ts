import { mockServerAdminWorkspaceId } from 'test/integration/graphql/suites/admin-panel/utils/mock-server-admin-workspace-id.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { impersonate } from 'test/integration/graphql/utils/impersonate.util';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

/* global APPLE_JANE_ADMIN_ACCESS_TOKEN */

describe('Server-level impersonation session outside the server admin workspace', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should refuse a running session once its impersonator workspace is no longer the server admin workspace', async () => {
    mockServerAdminWorkspaceId(SEED_APPLE_WORKSPACE_ID);

    const { data: impersonateData } = await impersonate({
      userId: USER_DATA_SEED_IDS.TIM,
      workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    const { data: tokensData } = await getAuthTokensFromLoginToken({
      loginToken: impersonateData.impersonate.loginToken.token,
      origin: impersonateData.impersonate.workspace.workspaceUrls.subdomainUrl,
      expectToFail: false,
    });

    const impersonationAccessToken =
      tokensData.getAuthTokensFromLoginToken.tokens
        .accessOrWorkspaceAgnosticToken.token;

    const { errors: errorsWhileAllowed } = await getCurrentUser({
      accessToken: impersonationAccessToken,
      expectToFail: false,
    });

    expect(errorsWhileAllowed).toBeUndefined();

    mockServerAdminWorkspaceId(SEED_YCOMBINATOR_WORKSPACE_ID);

    const { errors } = await getCurrentUser({
      accessToken: impersonationAccessToken,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
