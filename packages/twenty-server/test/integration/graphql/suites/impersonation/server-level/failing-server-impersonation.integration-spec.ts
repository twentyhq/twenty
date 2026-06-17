import { impersonate } from 'test/integration/graphql/utils/impersonate.util';

import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

// Jony has the server-level canImpersonate capability but no verified 2FA
// method. Outside development, server-level (cross-workspace) impersonation
// requires verified 2FA, so the attempt to impersonate Tim in the YCombinator
// workspace must be denied at the token-generation checkpoint.
const IMPERSONATOR_WITHOUT_2FA_ACCESS_TOKEN = APPLE_JONY_MEMBER_ACCESS_TOKEN;

describe('Server-level impersonation - 2FA denial (integration)', () => {
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
});
