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
      .post('/graphql')
      .set('Origin', ORIGIN.toString())
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
    const queryData = {
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
    };

    return client
      .post('/graphql')
      .set('Origin', ORIGIN.toString())
      .send(queryData)
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
});
