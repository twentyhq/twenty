import request from 'supertest';

export type RestAPIRequestMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export const makeRestAPIRequest = (
  method: RestAPIRequestMethod,
  path: string,
) => {
  const client = request(`http://localhost:${APP_PORT}`);

  return client[method]('/rest' + path)
    .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
    .send();
};
