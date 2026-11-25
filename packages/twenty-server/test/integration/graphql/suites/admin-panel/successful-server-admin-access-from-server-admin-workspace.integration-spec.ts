import { adminPanelRecentUsers } from 'test/integration/graphql/suites/admin-panel/utils/admin-panel-recent-users.util';
import { adminPanelTopWorkspaces } from 'test/integration/graphql/suites/admin-panel/utils/admin-panel-top-workspaces.util';
import { getServerAdmins } from 'test/integration/graphql/suites/admin-panel/utils/get-server-admins.util';
import { mockServerAdminWorkspaceId } from 'test/integration/graphql/suites/admin-panel/utils/mock-server-admin-workspace-id.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { impersonate } from 'test/integration/graphql/utils/impersonate.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { type BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

/* global APPLE_JANE_ADMIN_ACCESS_TOKEN */

type AllowedOperationTestContext = {
  request: () => Promise<{ errors: BaseGraphQLError[] }>;
};

const allowedOperationTestCases: EachTestingContext<AllowedOperationTestContext>[] =
  [
    {
      title: 'listing the server admins',
      context: {
        request: () => getServerAdmins({ expectToFail: false }),
      },
    },
    {
      title: 'listing the top workspaces',
      context: {
        request: () => adminPanelTopWorkspaces({ expectToFail: false }),
      },
    },
    {
      title: 'listing the recent users',
      context: {
        request: () => adminPanelRecentUsers({ expectToFail: false }),
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
            expectToFail: false,
          }),
      },
    },
  ];

describe('Server admin access from the server admin workspace', () => {
  beforeAll(() => {
    mockServerAdminWorkspaceId(SEED_APPLE_WORKSPACE_ID);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it.each(eachTestingContextFilter(allowedOperationTestCases))(
    'should allow $title',
    async ({ context }) => {
      const { errors } = await context.request();

      expect(errors).toBeUndefined();
    },
  );

  it('should report server admin privileges on the current user', async () => {
    const { data, errors } = await getCurrentUser({
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data.currentUser.canAccessFullAdminPanel).toBe(true);
    expect(data.currentUser.canImpersonate).toBe(true);
  });
});
