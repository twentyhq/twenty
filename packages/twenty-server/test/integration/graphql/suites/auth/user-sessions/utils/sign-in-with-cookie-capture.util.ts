import { type Response } from 'supertest';
import { buildWorkspaceOriginForSubdomain } from 'test/integration/graphql/utils/build-apple-workspace-origin.util';
import { getAuthTokensFromLoginTokenQueryFactory } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.query-factory.util';
import { getLoginTokenFromCredentialsQueryFactory } from 'test/integration/graphql/utils/get-login-token-from-credentials.query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { USER_SESSION_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-cookie-name.constant';
import { USER_SESSION_SECURE_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-secure-cookie-name.constant';

type RequestHeaders = {
  originHeader?: string;
  cookieHeader?: string;
};

// Supertest requests dispatch lazily, so Origin and Cookie can be set on the
// request makeMetadataAPIRequest already built. The explicit null token keeps
// these requests off Bearer authentication, which would bypass both the
// cookie auth path and the CSRF middleware; undefined would fall back to the
// util's default admin token.
export const postMetadataOperationWithHeaders = (
  graphqlOperation: Parameters<typeof makeMetadataAPIRequest>[0],
  { originHeader, cookieHeader }: RequestHeaders,
  expectedStatus = 200,
) => {
  const graphqlRequest = makeMetadataAPIRequest(graphqlOperation, null);

  if (originHeader !== undefined) {
    graphqlRequest.set('Origin', originHeader);
  }

  if (cookieHeader !== undefined) {
    graphqlRequest.set('Cookie', cookieHeader);
  }

  return graphqlRequest.expect(expectedStatus);
};

type SignInOptions = RequestHeaders & {
  email?: string;
  password?: string;
  workspaceSubdomain?: string;
};

// Runs the full credentials exchange (credentials -> login token -> auth
// tokens) and returns the raw supertest response of the final exchange, so
// callers can assert on set-cookie headers, not just the GraphQL body.
export const signInWithCookieCapture = async ({
  email = 'tim@apple.dev',
  password = 'tim@apple.dev',
  workspaceSubdomain = 'apple',
  originHeader,
  cookieHeader,
}: SignInOptions = {}): Promise<Response> => {
  const workspaceOrigin = buildWorkspaceOriginForSubdomain(workspaceSubdomain);

  const loginTokenResponse = await postMetadataOperationWithHeaders(
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

  return await postMetadataOperationWithHeaders(
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

export const getSetCookieHeaders = (response: Response): string[] =>
  Array.isArray(response.headers['set-cookie'])
    ? response.headers['set-cookie']
    : [];

// Which of the two names the server issues depends on SERVER_URL and
// AUTH_COOKIE_SAME_SITE, so callers match on both by default and read the name
// back off the response rather than assuming the insecure deployment. Specs
// that assert one specific variant pass the name explicitly.
const SESSION_COOKIE_NAMES = [
  USER_SESSION_SECURE_COOKIE_NAME,
  USER_SESSION_COOKIE_NAME,
];

// startsWith keeps the plain and __Host- names distinct: the prefixed name
// does not start with the plain one.
export const extractSessionCookie = (
  response: Response,
  cookieName?: string,
):
  | { rawCookie: string; cookieName: string; cookieHeader: string; sessionToken: string }
  | undefined => {
  const candidateNames =
    cookieName === undefined ? SESSION_COOKIE_NAMES : [cookieName];

  for (const candidateName of candidateNames) {
    const rawCookie = getSetCookieHeaders(response).find((cookie) =>
      cookie.startsWith(`${candidateName}=sess_`),
    );

    if (rawCookie === undefined) {
      continue;
    }

    const sessionToken = rawCookie
      .split(';')[0]
      .slice(`${candidateName}=`.length);

    return {
      rawCookie,
      cookieName: candidateName,
      cookieHeader: `${candidateName}=${sessionToken}`,
      sessionToken,
    };
  }

  return undefined;
};

// A deletion cookie is the name with an empty value and an epoch expiry; the
// extractor above will not match it because the value lacks the sess_ prefix.
export const hasClearingCookie = (
  response: Response,
  cookieName?: string,
): boolean => {
  const candidateNames =
    cookieName === undefined ? SESSION_COOKIE_NAMES : [cookieName];

  return getSetCookieHeaders(response).some((cookie) =>
    candidateNames.some(
      (candidateName) =>
        cookie.startsWith(`${candidateName}=;`) &&
        cookie.includes('Expires=Thu, 01 Jan 1970'),
    ),
  );
};
