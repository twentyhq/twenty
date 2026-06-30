import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { impersonate } from 'test/integration/graphql/utils/impersonate.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

describe('Impersonation - self-impersonation denial (integration)', () => {
  it('rejects a user impersonating themselves', async () => {
    const { errors } = await impersonate({
      userId: USER_DATA_SEED_IDS.JANE,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
