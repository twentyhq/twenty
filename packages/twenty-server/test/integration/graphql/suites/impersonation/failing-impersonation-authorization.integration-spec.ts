import { impersonate } from 'test/integration/graphql/utils/impersonate.util';
import { signUpInWorkspaceAndGetAccessToken } from 'test/integration/graphql/utils/sign-up-in-workspace-and-get-access-token.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

describe('Impersonation - authorization denials (integration)', () => {
  it('rejects a user without the impersonate permission', async () => {
    const memberWithoutPermissionAccessToken =
      await signUpInWorkspaceAndGetAccessToken(
        'impersonation-no-permission@apple.dev',
      );

    const { errors } = await impersonate({
      userId: USER_DATA_SEED_IDS.JONY,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      accessToken: memberWithoutPermissionAccessToken,
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(errors[0].message).toMatch(/permission/i);
  });

  // The following authorization-service denials are covered by
  // impersonation-authorization.service unit tests. They are not reproducible
  // against the dev seed here: every Apple user is a single-workspace admin
  // (canImpersonate + canAccessFullAdminPanel), so there is no cross-workspace
  // impersonator and no non-admin holding the IMPERSONATE permission to drive
  // them. Reproducing them in integration would require dedicated fixtures
  // (a second workspace membership, a custom role granting IMPERSONATE to a
  // non-admin user).
  it.todo(
    'rejects server-level impersonation without verified 2FA (needs cross-workspace fixture)',
  );
  it.todo(
    'rejects a non-admin with IMPERSONATE permission impersonating an admin (needs custom-role fixture)',
  );
});
