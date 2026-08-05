import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import {
  deleteWorkspaceInvitationsByEmail,
  seedWorkspaceInvitation,
} from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { signUpInWorkspaceOperationFactory } from 'test/integration/graphql/utils/sign-up-in-workspace-operation-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

describe('signUpInWorkspace with a valid personal invitation (integration)', () => {
  const email = `valid-invite-signup-${Date.now()}@example.com`;
  const token = `valid-invite-signup-token-${Date.now()}`;

  let accessToken: string | undefined;

  beforeAll(() =>
    seedWorkspaceInvitation({
      email,
      value: token,
      expiresAt: new Date(Date.now() + ONE_HOUR_IN_MS),
    }),
  );

  afterAll(async () => {
    if (accessToken) {
      await deleteUser({ accessToken, expectToFail: false });
    }

    await deleteWorkspaceInvitationsByEmail({ email });
  });

  it('grants access when the personal invitation is still valid', async () => {
    const response = await makeMetadataAPIRequest(
      signUpInWorkspaceOperationFactory({
        email,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        workspacePersonalInviteToken: token,
      }),
      undefined,
    );

    expect(response.body.errors).toBeUndefined();

    const signUpPayload = response.body.data.signUpInWorkspace;

    expect(signUpPayload.workspace.id).toBe(SEED_APPLE_WORKSPACE_ID);
    expect(signUpPayload.loginToken.token).toBeDefined();

    await testDataSource.query(
      'UPDATE core."user" SET "isEmailVerified" = true WHERE email = $1',
      [email],
    );

    const {
      data: { getAuthTokensFromLoginToken: authTokensData },
    } = await getAuthTokensFromLoginToken({
      loginToken: signUpPayload.loginToken.token,
      origin:
        signUpPayload.workspace.workspaceUrls?.subdomainUrl ??
        'http://localhost:3001',
      expectToFail: false,
    });

    accessToken = authTokensData.tokens.accessOrWorkspaceAgnosticToken.token;

    expect(accessToken).toBeDefined();
  });
});
