import { INestApplication } from '@nestjs/common';

import request from 'supertest';

const auth = {
  email: 'tim@apple.dev',
  password: 'Applecar2025',
};

/**
 * Function to authenticate and get an access token for the given app
 */
export const getAccessToken = async (
  app: INestApplication,
): Promise<string> => {
  try {
    // Perform the first mutation to get the login token
    const resChallenge = await request(app.getHttpServer())
      .post('/graphql')
      .send({
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
      });

    if (resChallenge.body.errors) {
      throw new Error(
        'Error during challenge mutation: ' +
          resChallenge.body.errors[0].message,
      );
    }

    const challengeToken = resChallenge.body.data.challenge.loginToken.token;

    // Perform the second mutation to verify the login token
    const resVerify = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation Verify {
            verify(loginToken: "${challengeToken}") {
              tokens {
                accessToken {
                  token
                }
              }
            }
          }
        `,
      });

    if (resVerify.body.errors) {
      throw new Error(
        'Error during verify mutation: ' + resVerify.body.errors[0].message,
      );
    }

    const accessToken = resVerify.body.data.verify.tokens.accessToken.token;

    return accessToken;
  } catch (error) {
    console.error('Failed to retrieve access token:', error.message);
    throw error;
  }
};
