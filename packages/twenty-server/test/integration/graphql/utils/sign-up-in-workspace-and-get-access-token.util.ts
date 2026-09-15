import gql from 'graphql-tag';
import request from 'supertest';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const APPLE_WORKSPACE_INVITE_HASH = 'apple.dev-invite-hash';

// Signs up a user in the Apple workspace, marks their email as verified,
// and returns a valid access token for that user.
export const signUpInWorkspaceAndGetAccessToken = async (
  email: string,
  password = 'Password123!',
): Promise<string> => {
  const client = request(`http://localhost:${APP_PORT}`);

  const enablePublicInviteLinkMutation = {
    query: `
      mutation updateWorkspace {
        updateWorkspace(data: { isPublicInviteLinkEnabled: true }) {
          id
          isPublicInviteLinkEnabled
        }
      }
    `,
  };

  await client
    .post('/metadata')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send(enablePublicInviteLinkMutation)
    .expect(200);

  const signUpInWorkspaceMutation = gql`
    mutation SignUpInWorkspace(
      $email: String!
      $password: String!
      $workspaceInviteHash: String
      $workspaceId: UUID
    ) {
      signUpInWorkspace(
        email: $email
        password: $password
        workspaceInviteHash: $workspaceInviteHash
        workspaceId: $workspaceId
      ) {
        loginToken {
          token
        }
        workspace {
          id
          workspaceUrls {
            subdomainUrl
          }
        }
      }
    }
  `;

  const signUpResponse = await makeMetadataAPIRequest(
    {
      query: signUpInWorkspaceMutation,
      variables: {
        email,
        password,
        workspaceInviteHash: APPLE_WORKSPACE_INVITE_HASH,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      },
    },
    undefined,
  );

  expect(signUpResponse.status).toBe(200);
  expect(signUpResponse.body.errors).toBeUndefined();

  const signUpPayload = signUpResponse.body.data.signUpInWorkspace;

  expect(signUpPayload.loginToken.token).toBeDefined();

  await testDataSource.query(
    'UPDATE core."user" SET "isEmailVerified" = true WHERE email = $1',
    [email],
  );

  const origin =
    signUpPayload.workspace.workspaceUrls?.subdomainUrl ??
    'http://localhost:3001';

  const {
    data: { getAuthTokensFromLoginToken: authTokensData },
  } = await getAuthTokensFromLoginToken({
    loginToken: signUpPayload.loginToken.token,
    origin,
    expectToFail: false,
  });

  return authTokensData.tokens.accessOrWorkspaceAgnosticToken.token;
};
