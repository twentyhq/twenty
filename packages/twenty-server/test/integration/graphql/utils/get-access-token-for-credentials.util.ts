import request from 'supertest';
import { buildWorkspaceOriginForSubdomain } from 'test/integration/graphql/utils/build-apple-workspace-origin.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';

const SERVER_URL = `http://localhost:${APP_PORT}`;

type GetAccessTokenForCredentialsArgs = {
  email: string;
  password?: string;
  workspaceSubdomain?: string;
};

// Mints a token by logging a seeded user in, instead of a pre-baked test-tokens.json entry
export const getAccessTokenForCredentials = async ({
  email,
  password = 'tim@apple.dev',
  workspaceSubdomain = 'apple',
}: GetAccessTokenForCredentialsArgs): Promise<string> => {
  const origin = buildWorkspaceOriginForSubdomain(workspaceSubdomain);

  const loginResponse = await request(SERVER_URL)
    .post('/metadata')
    .set('Origin', origin)
    .send({
      query: `
        mutation GetLoginTokenFromCredentials(
          $email: String!
          $password: String!
          $origin: String!
        ) {
          getLoginTokenFromCredentials(
            email: $email
            password: $password
            origin: $origin
          ) {
            loginToken {
              token
            }
          }
        }
      `,
      variables: { email, password, origin },
    })
    .expect(200);

  const loginToken =
    loginResponse.body.data.getLoginTokenFromCredentials.loginToken.token;

  const { data } = await getAuthTokensFromLoginToken({
    loginToken,
    origin,
    expectToFail: false,
  });

  return data.getAuthTokensFromLoginToken.tokens.accessOrWorkspaceAgnosticToken
    .token;
};
