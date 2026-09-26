import request from 'supertest';

const SERVER_URL = `http://localhost:${APP_PORT}`;

const client = request(SERVER_URL);

const ORIGIN = new URL(SERVER_URL);

ORIGIN.hostname =
  process.env.IS_MULTIWORKSPACE_ENABLED === 'true'
    ? `apple.${ORIGIN.hostname}`
    : ORIGIN.hostname;

const auth = {
  email: 'tim@apple.dev',
  password: 'tim@apple.dev',
};

describe('AuthResolve (integration)', () => {
  let loginToken: string;

  const exchangeLoginToken = () =>
    client
      .post('/metadata')
      .set('Host', ORIGIN.host)
      .set('Origin', ORIGIN.origin)
      .send({
        query: `
          mutation GetAuthTokensFromLoginToken {
            getAuthTokensFromLoginToken(loginToken: "${loginToken}", origin: "${ORIGIN.toString()}") {
              tokens {
                accessOrWorkspaceAgnosticToken {
                  token
                }
              }
            }
          }
        `,
      });

  it('should getLoginTokenFromCredentials with email and password', () => {
    const queryData = {
      query: `
        mutation GetLoginTokenFromCredentials {
          getLoginTokenFromCredentials(email: "${auth.email}", password: "${auth.password}", origin: "${ORIGIN.toString()}") {
            loginToken {
              token
              expiresAt
            }
          }
        }
      `,
    };

    return client
      .post('/metadata')
      .set('Host', ORIGIN.host)
      .set('Origin', ORIGIN.origin)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.getLoginTokenFromCredentials;

        expect(data).toBeDefined();
        expect(data.loginToken).toBeDefined();

        loginToken = data.loginToken.token;
      });
  });

  it('should getAuthTokensFromLoginToken with login token', () => {
    return exchangeLoginToken()
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.getAuthTokensFromLoginToken;

        expect(data).toBeDefined();
        expect(data.tokens).toBeDefined();

        const accessToken = data.tokens.accessOrWorkspaceAgnosticToken;

        expect(accessToken).toBeDefined();
        expect(accessToken.token).toBeDefined();
      });
  });

  it('should reject a login token that was already exchanged', () => {
    return exchangeLoginToken()
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeNull();
        expect(res.body.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED');
      });
  });
});
