import { randomUUID } from 'node:crypto';

import { activateWorkspace } from 'test/integration/graphql/utils/activate-workspace.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { renewToken } from 'test/integration/graphql/utils/renew-token.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { isDefined } from 'twenty-shared/utils';

export const createPermissionTestActiveWorkspace = async (): Promise<{
  workspaceId: string;
  workspaceOrigin: string;
  inviteHash: string;
  adminAccessToken: string;
}> => {
  const { data: signUpData } = await signUp({
    input: {
      email: `permission-admin-${randomUUID()}@example.com`,
      password: 'Test123!@#',
    },
    expectToFail: false,
  });

  const {
    data: { signUpInNewWorkspace: newWorkspace },
  } = await signUpInNewWorkspace({
    accessToken: signUpData.signUp.tokens.accessOrWorkspaceAgnosticToken.token,
    displayName: 'Record access',
    expectToFail: false,
  });

  const workspaceOrigin = newWorkspace.workspace.workspaceUrls.subdomainUrl;
  const {
    data: { getAuthTokensFromLoginToken: authTokens },
  } = await getAuthTokensFromLoginToken({
    origin: workspaceOrigin,
    loginToken: newWorkspace.loginToken.token,
    expectToFail: false,
  });

  const {
    data: { activateWorkspace: activatedWorkspace },
  } = await activateWorkspace({
    accessToken: authTokens.tokens.accessOrWorkspaceAgnosticToken.token,
    expectToFail: false,
  });

  const renewTokenResponse = await renewToken(
    authTokens.tokens.refreshToken.token,
  );

  expect(renewTokenResponse.body.errors).toBeUndefined();

  const { inviteHash } = activatedWorkspace;

  if (!isDefined(inviteHash)) {
    throw new Error('An activated workspace should have an invite hash');
  }

  return {
    workspaceId: newWorkspace.workspace.id,
    workspaceOrigin,
    inviteHash,
    adminAccessToken:
      renewTokenResponse.body.data.renewToken.tokens
        .accessOrWorkspaceAgnosticToken.token,
  };
};
