import request from 'supertest';

export type RestAPIRequestMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

interface RestAPIRequestParams {
  method: RestAPIRequestMethod;
  path: string;
  bearer?: string;
  body?: any;
}

export const makeRestAPIRequest = ({
  method,
  path,
  bearer = ADMIN_ACCESS_TOKEN,
  body = {},
}: RestAPIRequestParams) => {
  const client = request(`http://localhost:${APP_PORT}`);

  const req = client[method](`/rest${path}`)
    .set('Authorization', `Bearer ${bearer}`)
    .set('Content-Type', 'application/json');

  if (['post', 'patch', 'put'].includes(method)) {
    req.send(JSON.stringify(body));
  }

  return req;
};
