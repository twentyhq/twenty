import { getAccessTokenForCredentials } from 'test/integration/graphql/utils/get-access-token-for-credentials.util';
import { impersonate } from 'test/integration/graphql/utils/impersonate.util';

import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

// Jony has the server-level canImpersonate capability but no verified 2FA
// method. Outside development, server-level (cross-workspace) impersonation
// requires verified 2FA, so the attempt to impersonate Tim in the YCombinator
// workspace must be denied at the token-generation checkpoint.
const IMPERSONATOR_WITHOUT_2FA_ACCESS_TOKEN = APPLE_JONY_MEMBER_ACCESS_TOKEN;

describe('Server-level impersonation - authorization denials (integration)', () => {
  it('rejects cross-workspace impersonation when the impersonator has no verified 2FA', async () => {
    const { errors } = await impersonate({
      userId: USER_DATA_SEED_IDS.TIM,
      workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
      accessToken: IMPERSONATOR_WITHOUT_2FA_ACCESS_TOKEN,
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(errors[0].message).toContain(
      'Two-factor authentication is required for server-level impersonation',
    );
  });

  it('rejects a non-admin with only the workspace impersonate permission from impersonating across workspaces', async () => {
    const scottAccessToken = await getAccessTokenForCredentials({
      email: 'scott.forstall@apple.dev',
    });

    const { errors } = await impersonate({
      userId: USER_DATA_SEED_IDS.JONY,
      workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
      accessToken: scottAccessToken,
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(errors[0].message).toContain(
      'Server level impersonation not allowed',
    );
  });
});
