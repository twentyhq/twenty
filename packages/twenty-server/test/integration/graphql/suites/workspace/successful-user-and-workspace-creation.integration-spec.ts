import { activateWorkspace } from 'test/integration/graphql/utils/activate-workspace.util';
import { getCurrentUser } from 'test/integration/graphql/utils/current-user.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
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
    const { inviteHash, ...expectedCurrentWorkspace } = activateWorkspaceData;
    expect(currentUser.currentWorkspace).toMatchObject(expectedCurrentWorkspace);
    expect(currentUser).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny({ ...currentUser }),
    );
  });
});
