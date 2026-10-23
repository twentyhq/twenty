import { randomUUID } from 'crypto';

import { findApplicationDefaultRole } from 'test/integration/metadata/suites/application-default-role/utils/find-application-default-role.util';
import { activateWorkspace } from 'test/integration/graphql/utils/activate-workspace.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

describe('A new workspace gives the standard application Admin as default role', () => {
  let workspaceId: string | undefined;
  let accessToken: string;

  beforeAll(async () => {
    jest.useRealTimers();

    const email = `test-${randomUUID()}@example.com`;
    const { data: signUpData } = await signUp({
      input: { email, password: 'Test123!@#' },
      expectToFail: false,
    });

    await globalThis.testDataSource.query(
      'UPDATE core."user" SET "isEmailVerified" = true WHERE email = $1',
      [email],
    );

    const {
      data: { signUpInNewWorkspace: newWorkspaceData },
    } = await signUpInNewWorkspace({
      accessToken:
        signUpData.signUp.tokens.accessOrWorkspaceAgnosticToken.token,
      expectToFail: false,
    });

    workspaceId = newWorkspaceData.workspace.id;

    const {
      data: { getAuthTokensFromLoginToken: authTokensData },
    } = await getAuthTokensFromLoginToken({
      origin: newWorkspaceData.workspace.workspaceUrls.subdomainUrl,
      loginToken: newWorkspaceData.loginToken.token,
      expectToFail: false,
    });

    accessToken = authTokensData.tokens.accessOrWorkspaceAgnosticToken.token;

    await activateWorkspace({ accessToken, expectToFail: false });
  });

  afterAll(async () => {
    if (isDefined(workspaceId)) {
      await getAppProviderByClassName<WorkspaceService>(
        'WorkspaceService',
      ).deleteWorkspace(workspaceId);
    }
  });

  it('gives the standard application the Admin role', async () => {
    const standardApplicationDefaultRole = await findApplicationDefaultRole({
      input: {
        universalIdentifier: TWENTY_STANDARD_APPLICATION.universalIdentifier,
      },
      token: accessToken,
    });

    expect(standardApplicationDefaultRole).toMatchObject({
      label: 'Admin',
      universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
    });
  });
});
