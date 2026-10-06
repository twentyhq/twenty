import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

export const workflowGraphqlRequest = (
  query: string,
  variables?: object,
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${token}`)
    .send({ query, variables });
