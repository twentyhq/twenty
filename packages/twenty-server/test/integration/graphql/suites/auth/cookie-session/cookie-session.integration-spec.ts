import request from 'supertest';
import { deleteConfigVariable } from 'test/integration/twenty-config/utils/delete-config-variable.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';

import { USER_SESSION_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-cookie-name.constant';

const AUTH_COOKIE_SESSIONS_ENABLED_KEY = 'AUTH_COOKIE_SESSIONS_ENABLED';
const SERVER_URL = `http://localhost:${APP_PORT}`;

const buildAppleOrigin = (): string => {
  const origin = new URL(SERVER_URL);

  origin.hostname =
    process.env.IS_MULTIWORKSPACE_ENABLED === 'true'
      ? `apple.${origin.hostname}`
      : origin.hostname;

  return origin.origin;
};

// The app listens on localhost while the seeded workspace resolves from the
// apple subdomain. Without a matching Host the server sees a cross-origin
// request and refuses to issue the cookie, which is the behaviour under test
// everywhere except here.
const asWorkspaceRequest = (
  agent: request.Test,
  originOverride?: string,
): request.Test => {
  const host = new URL(origin).host;

  return originOverride === undefined
    ? agent.set('Host', host).set('Origin', origin)
    : agent.set('Host', host).set('Origin', originOverride);
};

const CURRENT_USER_QUERY = `
  query CurrentUser {
    currentUser {
      id
      email
    }
  }
`;

const SIGN_OUT_MUTATION = `
  mutation SignOut {
    signOut
  }
`;

const extractSessionCookie = (
  setCookieHeader: string[] | undefined,
): string | undefined =>
  setCookieHeader
    ?.find((cookie) => cookie.startsWith(`${USER_SESSION_COOKIE_NAME}=`))
    ?.split(';')[0];

const origin = buildAppleOrigin();

describe('Cookie sessions (integration)', () => {
  let sessionCookie: string;

  beforeAll(async () => {
    await updateConfigVariable({
      input: { key: AUTH_COOKIE_SESSIONS_ENABLED_KEY, value: true },
    });

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

    const extractedCookie = extractSessionCookie(
      exchangeResponse.headers['set-cookie'] as string[] | undefined,
    );

    expect(extractedCookie).toBeDefined();

    sessionCookie = extractedCookie as string;
  });

  afterAll(async () => {
    await deleteConfigVariable({
      input: { key: AUTH_COOKIE_SESSIONS_ENABLED_KEY },
    });
  });

  it('should set a session cookie when exchanging a login token', () => {
    expect(sessionCookie).toContain(`${USER_SESSION_COOKIE_NAME}=sess_`);
  });

  it('should authenticate a request carrying only the session cookie', async () => {
    const response = await asWorkspaceRequest(
      request(SERVER_URL).post('/metadata'),
    )
      .set('Cookie', sessionCookie)
      .send({ query: CURRENT_USER_QUERY })
      .expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.currentUser.email).toBe('tim@apple.dev');
  });

  it('should reject a cookie-authenticated request from a foreign origin', async () => {
    const response = await asWorkspaceRequest(
      request(SERVER_URL).post('/metadata'),
      'https://evil.example.org',
    )
      .set('Cookie', sessionCookie)
      .send({ query: CURRENT_USER_QUERY });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('CSRF_ORIGIN_MISMATCH');
  });

  it('should reject a cookie-authenticated request sending no origin', async () => {
    const response = await request(SERVER_URL)
      .post('/metadata')
      .set('Host', new URL(origin).host)
      .set('Cookie', sessionCookie)
      .send({ query: CURRENT_USER_QUERY });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('CSRF_ORIGIN_MISMATCH');
  });

  it('should stop authenticating the cookie once signed out', async () => {
    const signOutResponse = await asWorkspaceRequest(
      request(SERVER_URL).post('/metadata'),
    )
      .set('Cookie', sessionCookie)
      .send({ query: SIGN_OUT_MUTATION })
      .expect(200);

    expect(signOutResponse.body.errors).toBeUndefined();

    const afterSignOut = await asWorkspaceRequest(
      request(SERVER_URL).post('/metadata'),
    )
      .set('Cookie', sessionCookie)
      .send({ query: CURRENT_USER_QUERY });

    expect(afterSignOut.body.data?.currentUser).toBeFalsy();
    expect(afterSignOut.body.errors).toBeDefined();
  });
});
