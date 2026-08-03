import request, { type Response } from 'supertest';

const SERVER_URL = `http://localhost:${APP_PORT}`;

// The GraphQL `origin` variable selects the workspace (multiworkspace resolves
// it by subdomain); the HTTP Origin header is what the cookie issuance gate
// and the CSRF middleware read. They are independent inputs.
export const buildAppleWorkspaceOrigin = (): string => {
  const origin = new URL(SERVER_URL);

  origin.hostname =
    process.env.IS_MULTIWORKSPACE_ENABLED === 'true'
      ? `apple.${origin.hostname}`
      : origin.hostname;

  return origin.toString();
};

type SignInOptions = {
  email?: string;
  password?: string;
  originHeader?: string;
  cookieHeader?: string;
};

// Runs the full credentials exchange (credentials -> login token -> auth
// tokens) and returns the raw supertest response of the final exchange, so
// callers can assert on set-cookie headers, not just the GraphQL body.
export const signInWithCookieCapture = async ({
  email = 'tim@apple.dev',
  password = 'tim@apple.dev',
  originHeader,
  cookieHeader,
}: SignInOptions = {}): Promise<Response> => {
  const workspaceOrigin = buildAppleWorkspaceOrigin();

  const loginTokenRequest = request(SERVER_URL).post('/metadata');

  if (originHeader !== undefined) {
    loginTokenRequest.set('Origin', originHeader);
  }

  if (cookieHeader !== undefined) {
    loginTokenRequest.set('Cookie', cookieHeader);
  }

  const loginTokenResponse = await loginTokenRequest
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
      variables: { email, password, origin: workspaceOrigin },
    })
    .expect(200);

  const loginToken =
    loginTokenResponse.body.data?.getLoginTokenFromCredentials?.loginToken
      ?.token;

  expect(loginToken).toBeDefined();

  const authTokensRequest = request(SERVER_URL).post('/metadata');

  if (originHeader !== undefined) {
    authTokensRequest.set('Origin', originHeader);
  }

  if (cookieHeader !== undefined) {
    authTokensRequest.set('Cookie', cookieHeader);
  }

  return await authTokensRequest
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
                expiresAt
              }
              refreshToken {
                token
                expiresAt
              }
            }
          }
        }
      `,
      variables: { loginToken, origin: workspaceOrigin },
    })
    .expect(200);
};

export const extractSessionCookie = (
  response: Response,
): { rawCookie: string; sessionToken: string } | undefined => {
  const setCookieHeaders: string[] = Array.isArray(
    response.headers['set-cookie'],
  )
    ? response.headers['set-cookie']
    : [];

  const rawCookie = setCookieHeaders.find((cookie) =>
    cookie.startsWith('twenty-session='),
  );

  if (rawCookie === undefined) {
    return undefined;
  }

  return {
    rawCookie,
    sessionToken: rawCookie.split(';')[0].slice('twenty-session='.length),
  };
};
