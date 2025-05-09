import request from 'supertest';

/* global APP_PORT */

/**
 * Make unauthenticated GraphQL API request without any token.
 * Used to test permission restrictions on protected endpoints.
 */
export const makeUnauthenticatedAPIRequest = async (query: string) => {
  const client = request(`http://localhost:${APP_PORT}`);

  return client
    .post('/graphql')
    .send({
      query,
    })
    .expect(200); // Still expect 200 as GraphQL returns errors in the response body
};
