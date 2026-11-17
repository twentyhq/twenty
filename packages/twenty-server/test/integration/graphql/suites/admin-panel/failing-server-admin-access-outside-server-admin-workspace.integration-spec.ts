import { adminPanelRecentUsers } from 'test/integration/graphql/suites/admin-panel/utils/admin-panel-recent-users.util';
import { adminPanelTopWorkspaces } from 'test/integration/graphql/suites/admin-panel/utils/admin-panel-top-workspaces.util';
import { getServerAdmins } from 'test/integration/graphql/suites/admin-panel/utils/get-server-admins.util';
import { mockServerAdminWorkspaceId } from 'test/integration/graphql/suites/admin-panel/utils/mock-server-admin-workspace-id.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { impersonate } from 'test/integration/graphql/utils/impersonate.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { type BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

/* global APPLE_JANE_ADMIN_ACCESS_TOKEN */

type RefusedOperationTestContext = {
  request: () => Promise<{ errors: BaseGraphQLError[] }>;
};

const refusedOperationTestCases: EachTestingContext<RefusedOperationTestContext>[] =
  [
    {
      title: 'listing the server admins',
      context: {
        request: () => getServerAdmins({ expectToFail: true }),
      },
    },
    {
      title: 'listing the top workspaces',
      context: {
        request: () => adminPanelTopWorkspaces({ expectToFail: true }),
      },
    },
    {
      title: 'listing the recent users',
      context: {
        request: () => adminPanelRecentUsers({ expectToFail: true }),
      },
    },
    {
      title: 'impersonating a user in another workspace',
      context: {
        request: () =>
          impersonate({
            userId: USER_DATA_SEED_IDS.TIM,
            workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
            accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
            expectToFail: true,
          }),
      },
    },
  ];

describe('Server admin access outside the server admin workspace', () => {
  beforeAll(() => {
    mockServerAdminWorkspaceId(SEED_YCOMBINATOR_WORKSPACE_ID);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it.each(eachTestingContextFilter(refusedOperationTestCases))(
    'should refuse $title',
    async ({ context }) => {
      const { errors } = await context.request();

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
  );

  it('should not report server admin privileges on the current user', async () => {
    const { data, errors } = await getCurrentUser({
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data.currentUser.canAccessFullAdminPanel).toBe(false);
    expect(data.currentUser.canImpersonate).toBe(false);
  });
});
