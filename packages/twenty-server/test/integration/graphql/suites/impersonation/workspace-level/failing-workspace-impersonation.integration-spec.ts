import { getAccessTokenForCredentials } from 'test/integration/graphql/utils/get-access-token-for-credentials.util';
import { impersonate } from 'test/integration/graphql/utils/impersonate.util';
import { signUpInWorkspaceAndGetAccessToken } from 'test/integration/graphql/utils/sign-up-in-workspace-and-get-access-token.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

describe('Workspace-level impersonation - authorization denials (integration)', () => {
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

  // Scott is a seeded non-admin Apple member (canImpersonate /
  // canAccessFullAdminPanel both false) whose role grants only the IMPERSONATE
  // permission flag. He passes the impersonate permission guard but must still
  // be blocked from impersonating an admin (Jony) by the escalation check.
  it('rejects a non-admin with the impersonate permission impersonating an admin', async () => {
    const scottAccessToken = await getAccessTokenForCredentials({
      email: 'scott.forstall@apple.dev',
    });

    const { errors } = await impersonate({
      userId: USER_DATA_SEED_IDS.JONY,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      accessToken: scottAccessToken,
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(errors[0].message).toContain(
      'Cannot impersonate a user with admin privileges',
    );
  });
});
