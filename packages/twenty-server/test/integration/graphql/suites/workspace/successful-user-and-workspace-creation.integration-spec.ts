import { activateWorkspace } from 'test/integration/graphql/utils/activate-workspace.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/twenty-standard-applications';

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
        email: `test-1234@example.com`,
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
    const { inviteHash: _, ...expectedCurrentWorkspace } =
      activateWorkspaceData;

    jestExpectToBeDefined(currentUser.currentWorkspace);
    expect(currentUser.currentWorkspace).toMatchObject(
      expectedCurrentWorkspace,
    );

    const {
      data: { findManyApplications: findManyApplicationsData },
    } = await findManyApplications({
      accessToken: newWorkspaceAccessToken,
      expectToFail: false,
    });

    expect(findManyApplicationsData.length).toBe(2);
    const twentyStandardApp = findManyApplicationsData.find(
      (application) =>
        application.universalIdentifier ===
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
    );

    jestExpectToBeDefined(twentyStandardApp);
    const {
      sourcePath: _sourcePath,
      sourceType: _sourceType,
      ...expectedStandardTwentyApplication
    } = TWENTY_STANDARD_APPLICATION;

    expect(twentyStandardApp).toMatchObject(expectedStandardTwentyApplication);

    const workpsaceCustomApplication = findManyApplicationsData.find(
      (application) =>
        application.id ===
        currentUser.currentWorkspace?.workspaceCustomApplicationId,
    );

    jestExpectToBeDefined(workpsaceCustomApplication);
    expect(workpsaceCustomApplication.universalIdentifier).toEqual(
      workpsaceCustomApplication.id,
    );
  });
});
