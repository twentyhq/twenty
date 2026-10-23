import { randomUUID } from 'crypto';

import {
  findApplicationDefaultRole,
  findWorkspaceCustomApplicationId,
} from 'test/integration/metadata/suites/application-default-role/utils/find-application-default-role.util';
import { activateWorkspace } from 'test/integration/graphql/utils/activate-workspace.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';

const ADMIN_PERMISSIONS = {
  isEditable: false,
  canUpdateAllSettings: true,
  canAccessAllTools: true,
  canAccessAllAgentChatChannels: true,
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: true,
};

const UNASSIGNABLE_ROLE = {
  canBeAssignedToUsers: false,
  canBeAssignedToAgents: false,
  canBeAssignedToApiKeys: false,
};

describe('A new workspace gives the custom application its own default role', () => {
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

  it('gives the custom application a locked, Admin-equivalent role it owns and nobody can be assigned', async () => {
    const customApplicationId =
      await findWorkspaceCustomApplicationId(accessToken);
    const customApplicationDefaultRole = await findApplicationDefaultRole({
      input: { id: customApplicationId },
      token: accessToken,
    });

    expect(customApplicationDefaultRole).toMatchObject({
      ...ADMIN_PERMISSIONS,
      ...UNASSIGNABLE_ROLE,
      applicationId: customApplicationId,
    });
  });
});
