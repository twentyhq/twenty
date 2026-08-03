import { print, type ASTNode } from 'graphql';
import request, { type Response } from 'supertest';
import { getAuthTokensFromLoginTokenQueryFactory } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.query-factory.util';
import { getLoginTokenFromCredentialsQueryFactory } from 'test/integration/graphql/utils/get-login-token-from-credentials.query-factory.util';

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

type RequestHeaders = {
  originHeader?: string;
  cookieHeader?: string;
};

const postGraphqlOperation = (
  graphqlOperation: { query: ASTNode; variables: Record<string, unknown> },
  { originHeader, cookieHeader }: RequestHeaders,
) => {
  const graphqlRequest = request(SERVER_URL).post('/metadata');

  if (originHeader !== undefined) {
    graphqlRequest.set('Origin', originHeader);
  }

  if (cookieHeader !== undefined) {
    graphqlRequest.set('Cookie', cookieHeader);
  }

  return graphqlRequest
    .send({
      query: print(graphqlOperation.query),
      variables: graphqlOperation.variables,
    })
    .expect(200);
};

type SignInOptions = RequestHeaders & {
  email?: string;
  password?: string;
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

  const loginTokenResponse = await postGraphqlOperation(
    getLoginTokenFromCredentialsQueryFactory({
      email,
      password,
      origin: workspaceOrigin,
    }),
    { originHeader, cookieHeader },
  );

  const loginToken =
    loginTokenResponse.body.data?.getLoginTokenFromCredentials?.loginToken
      ?.token;

  expect(loginToken).toBeDefined();

  return await postGraphqlOperation(
    getAuthTokensFromLoginTokenQueryFactory({
      loginToken,
      origin: workspaceOrigin,
    }),
    { originHeader, cookieHeader },
  );
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
