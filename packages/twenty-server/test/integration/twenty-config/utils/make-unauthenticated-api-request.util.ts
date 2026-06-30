import request from 'supertest';

export const makeUnauthenticatedAPIRequest = async (query: string) => {
  const client = request(`http://localhost:${APP_PORT}`);

  return client
    .post('/admin-panel')
    .send({
      query,
    })
    .expect(200);
};
