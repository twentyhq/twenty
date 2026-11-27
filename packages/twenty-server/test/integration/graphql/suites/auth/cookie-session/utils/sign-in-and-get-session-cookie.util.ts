import request from 'supertest';
import { asWorkspaceRequest } from 'test/integration/graphql/suites/auth/cookie-session/utils/as-workspace-request.util';
import { buildAppleHttpOrigin } from 'test/integration/graphql/suites/auth/cookie-session/utils/build-apple-http-origin.util';
import { extractSessionCookie } from 'test/integration/graphql/suites/auth/cookie-session/utils/extract-session-cookie.util';

const SERVER_URL = `http://localhost:${APP_PORT}`;

export const signInAndGetSessionCookie = async (): Promise<string> => {
  const origin = buildAppleHttpOrigin();

  const loginResponse = await asWorkspaceRequest(
    request(SERVER_URL).post('/metadata'),
  )
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
      variables: {
        email: 'tim@apple.dev',
        password: 'tim@apple.dev',
        origin,
      },
    })
    .expect(200);

  const loginToken =
    loginResponse.body.data.getLoginTokenFromCredentials.loginToken.token;

  const exchangeResponse = await asWorkspaceRequest(
    request(SERVER_URL).post('/metadata'),
  )
    .send({
      query: `
        mutation GetAuthTokensFromLoginToken(
          $loginToken: String!
          $origin: String!
        ) {
          getAuthTokensFromLoginToken(loginToken: $loginToken, origin: $origin) {
            tokens {
              accessOrWorkspaceAgnosticToken {
                token
              }
            }
          }
        }
      `,
      variables: { loginToken, origin },
    })
    .expect(200);

  const sessionCookie = extractSessionCookie(
    exchangeResponse.headers['set-cookie'],
  );

  expect(sessionCookie).toBeDefined();

  return sessionCookie as string;
};
