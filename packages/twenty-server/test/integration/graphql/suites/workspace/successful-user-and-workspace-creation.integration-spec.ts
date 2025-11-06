import { activateWorkspace } from 'test/integration/graphql/utils/activate-workspace.util';
import { getCurrentUser } from 'test/integration/graphql/utils/current-user.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

describe('Successful user and workspace creation', () => {
  let createdUserAccessToken: string | undefined;

  afterEach(async () => {
    if (!isDefined(createdUserAccessToken)) {
      return;
    }

    await deleteUser({
      accessToken: createdUserAccessToken,
      expectToFail: false,
    });
  });

  it('should sign up a new user and create a new workspace successfully', async () => {
    const { data } = await signUp({
      input: {
        email: `test-123@example.com`,
        password: 'Test123!@#',
      },

      expectToFail: false,
    });

    createdUserAccessToken =
      data.signUp.tokens.accessOrWorkspaceAgnosticToken.token;

    const {
      data: { signUpInNewWorkspace: signUpInNewWorkspaceData },
    } = await signUpInNewWorkspace({
      accessToken: createdUserAccessToken,
      expectToFail: false,
    });

    const {
      data: { getAuthTokensFromLoginToken: authTokensData },
    } = await getAuthTokensFromLoginToken({
      origin: signUpInNewWorkspaceData.workspace.workspaceUrls.subdomainUrl,
      loginToken: signUpInNewWorkspaceData.loginToken.token,
      expectToFail: false,
    });

    const newWorkspaceAccessToken =
      authTokensData.tokens.accessOrWorkspaceAgnosticToken.token;

    const {
      data: { activateWorkspace: activateWorkspaceData },
    } = await activateWorkspace({
      accessToken: newWorkspaceAccessToken,
      displayName: '42 answer',
      expectToFail: false,
    });

    expect(activateWorkspaceData.activationStatus).toBe(
      WorkspaceActivationStatus.ACTIVE,
    );

    const {
      data: { currentUser },
    } = await getCurrentUser({
      accessToken: newWorkspaceAccessToken,
      expectToFail: false,
    });

    jestExpectToBeDefined(currentUser.currentWorkspace);
    const { inviteHash: _, ...expectedCurrentWorkspace } = activateWorkspaceData;

    expect(currentUser.currentWorkspace).toMatchObject(
      expectedCurrentWorkspace,
    );

    const {
      data: { findManyApplications: findManyApplicationsData },
    } = await findManyApplications({
      expectToFail: false,
    });

    expect(findManyApplicationsData.length).toBe(3);
    expect(findManyApplicationsData).toMatchInlineSnapshot(`
[
  {
    "description": "Twenty is an open-source CRM that allows you to manage your sales and customer relationships",
    "id": "f42089e0-9902-4647-a170-a34080010024",
    "name": "Twenty Standard",
    "version": "1.0.0",
  },
  {
    "description": "Workflow automation engine for Twenty CRM",
    "id": "7e887222-1f08-4ad6-a919-7987c3d12525",
    "name": "Twenty Workflows",
    "version": "1.0.0",
  },
  {
    "description": "Workspace custom application",
    "id": "c376290a-ab94-41e1-aa3b-227fecc29e60",
    "name": "Apple's custom application",
    "version": "1.0.0",
  },
]
`);
  });
});
