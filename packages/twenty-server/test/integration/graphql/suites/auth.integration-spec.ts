import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

const auth = {
  email: 'tim@apple.dev',
  password: 'Applecar2025',
};

describe('AuthResolve (integration)', () => {
  let loginToken: string;

  it('should challenge with email and password', () => {
    const queryData = {
      query: `
        mutation Challenge {
          challenge(email: "${auth.email}", password: "${auth.password}") {
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
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.challenge;

        expect(data).toBeDefined();
        expect(data.loginToken).toBeDefined();

        loginToken = data.loginToken.token;
      });
  });

  it('should verify with login token', () => {
    const queryData = {
      query: `
        mutation Verify {
          verify(loginToken: "${loginToken}") {
            tokens {
              accessToken {
                token
              }
            }
          }
        }
      `,
    };

    return client
      .post('/graphql')
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.verify;

        expect(data).toBeDefined();
        expect(data.tokens).toBeDefined();

        const accessToken = data.tokens.accessToken;

        expect(accessToken).toBeDefined();
        expect(accessToken.token).toBeDefined();
      });
  });
});
