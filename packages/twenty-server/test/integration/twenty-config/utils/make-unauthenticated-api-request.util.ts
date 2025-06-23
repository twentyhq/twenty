import request from 'supertest';

export const makeUnauthenticatedAPIRequest = async (query: string) => {
  const client = request(`http://localhost:${APP_PORT}`);

  return client
    .post('/graphql')
    .send({
      query,
    })
    .expect(200);
};
