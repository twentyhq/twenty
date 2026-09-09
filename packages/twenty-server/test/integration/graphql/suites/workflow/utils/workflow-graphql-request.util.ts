import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

export const workflowGraphqlRequest = (query: string, variables?: object) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({ query, variables });
