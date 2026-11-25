import { randomUUID } from 'node:crypto';

import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { signUpInWorkspaceOperationFactory } from 'test/integration/graphql/utils/sign-up-in-workspace-operation-factory.util';
import { findPermissionTestWorkspaceMemberOperationFactory } from 'test/integration/permissions/utils/find-permission-test-workspace-member-operation-factory.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const addPermissionTestWorkspaceMember = async ({
  workspaceId,
  workspaceOrigin,
  inviteHash,
  roleId,
  adminAccessToken,
}: {
  workspaceId: string;
  workspaceOrigin: string;
  inviteHash: string;
  roleId: string;
  adminAccessToken: string;
}) => {
  const email = `permission-member-${randomUUID()}@example.com`;
  const signUpResponse = await makeMetadataApiRequest(
    signUpInWorkspaceOperationFactory({
      email,
      workspaceId,
      workspaceInviteHash: inviteHash,
    }),
  );

  expect(signUpResponse.body.errors).toBeUndefined();

  const {
    data: { getAuthTokensFromLoginToken: authTokens },
  } = await getAuthTokensFromLoginToken({
    origin: workspaceOrigin,
    loginToken: signUpResponse.body.data.signUpInWorkspace.loginToken.token,
    expectToFail: false,
  });
  const accessToken = authTokens.tokens.accessOrWorkspaceAgnosticToken.token;
  const currentUserResponse = await makeMetadataApiRequest(
    findPermissionTestWorkspaceMemberOperationFactory(),
    accessToken,
  );

  expect(currentUserResponse.body.errors).toBeUndefined();

  const workspaceMemberId: string =
    currentUserResponse.body.data.currentUser.workspaceMember.id;

  await updateWorkspaceMemberRole({
    input: { workspaceMemberId, roleId },
    expectToFail: false,
    token: adminAccessToken,
  });

  return workspaceMemberId;
};
