import request from 'supertest';
import { buildAppleWorkspaceOrigin } from 'test/integration/graphql/utils/build-apple-workspace-origin.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';

const SERVER_URL = `http://localhost:${APP_PORT}`;

type GetAccessTokenForCredentialsArgs = {
  email: string;
  password?: string;
};

// Logs a seeded Apple user in with email/password and returns a usable
// access token, minting it dynamically rather than relying on a pre-baked
// entry in test-tokens.json.
export const getAccessTokenForCredentials = async ({
  email,
  password = 'tim@apple.dev',
}: GetAccessTokenForCredentialsArgs): Promise<string> => {
  const origin = buildAppleWorkspaceOrigin();

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
