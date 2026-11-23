import { adminPanelRecentUsers } from 'test/integration/graphql/suites/admin-panel/utils/admin-panel-recent-users.util';
import { adminPanelTopWorkspaces } from 'test/integration/graphql/suites/admin-panel/utils/admin-panel-top-workspaces.util';
import { getServerAdmins } from 'test/integration/graphql/suites/admin-panel/utils/get-server-admins.util';
import { mockServerAdminWorkspaceId } from 'test/integration/graphql/suites/admin-panel/utils/mock-server-admin-workspace-id.util';
import { getAccessTokenForCredentials } from 'test/integration/graphql/utils/get-access-token-for-credentials.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { getYcombinatorAdminAccessToken } from 'test/integration/sso/utils/get-ycombinator-admin-access-token.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

type WorkspaceTestContext = {
  getAccessToken: () => Promise<string>;
};

const workspaceTestCases: EachTestingContext<WorkspaceTestContext>[] = [
  {
    title: 'the Apple workspace',
    context: {
      getAccessToken: () =>
        getAccessTokenForCredentials({ email: 'tim@apple.dev' }),
    },
  },
  {
    title: 'the YCombinator workspace',
    context: {
      getAccessToken: getYcombinatorAdminAccessToken,
    },
  },
];

describe('Server admin access without a server admin workspace', () => {
  beforeAll(() => {
    mockServerAdminWorkspaceId(undefined);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it.each(eachTestingContextFilter(workspaceTestCases))(
    'should allow server admin operations from $title',
    async ({ context }) => {
      const token = await context.getAccessToken();

      const { errors: serverAdminsErrors } = await getServerAdmins({
        token,
        expectToFail: false,
      });
      const { errors: topWorkspacesErrors } = await adminPanelTopWorkspaces({
        token,
        expectToFail: false,
      });
      const { errors: recentUsersErrors } = await adminPanelRecentUsers({
        token,
        expectToFail: false,
      });
      const { data: currentUserData, errors: currentUserErrors } =
        await getCurrentUser({ accessToken: token, expectToFail: false });

      expect(serverAdminsErrors).toBeUndefined();
      expect(topWorkspacesErrors).toBeUndefined();
      expect(recentUsersErrors).toBeUndefined();
      expect(currentUserErrors).toBeUndefined();
      expect(currentUserData.currentUser.canAccessFullAdminPanel).toBe(true);
      expect(currentUserData.currentUser.canImpersonate).toBe(true);
    },
  );
});
