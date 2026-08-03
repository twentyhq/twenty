import { type Response } from 'supertest';
import { getAuthTokensFromLoginTokenQueryFactory } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.query-factory.util';
import { getLoginTokenFromCredentialsQueryFactory } from 'test/integration/graphql/utils/get-login-token-from-credentials.query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

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

// Supertest requests dispatch lazily, so Origin and Cookie can be set on the
// request makeMetadataAPIRequest already built. The explicit undefined token
// keeps these exchanges public instead of Bearer-authenticated.
const postPublicMetadataOperation = (
  graphqlOperation: Parameters<typeof makeMetadataAPIRequest>[0],
  { originHeader, cookieHeader }: RequestHeaders,
) => {
  const graphqlRequest = makeMetadataAPIRequest(graphqlOperation, undefined);

  if (originHeader !== undefined) {
    graphqlRequest.set('Origin', originHeader);
  }

  if (cookieHeader !== undefined) {
    graphqlRequest.set('Cookie', cookieHeader);
  }

  return graphqlRequest.expect(200);
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

  const loginTokenResponse = await postPublicMetadataOperation(
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

  return await postPublicMetadataOperation(
    getAuthTokensFromLoginTokenQueryFactory({
      loginToken,
      origin: workspaceOrigin,
    }),
    { originHeader, cookieHeader },
  );
};

// Redacts the two dynamic parts (token value, expiry timestamp) so the rest of
// the set-cookie header can be snapshot: name, attribute list and order are
// deterministic, and the snapshot also pins the absence of Domain and Secure.
export const normalizeSessionCookieForSnapshot = (rawCookie: string): string =>
  rawCookie
    .replace(/=sess_[A-Za-z0-9_-]+/, '=sess_<redacted>')
    .replace(/Expires=[^;]+/, 'Expires=<redacted>');

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
