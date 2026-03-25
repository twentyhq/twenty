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
  bearer = API_KEY_ACCESS_TOKEN,
  body = {},
}: RestAPIRequestParams) => {
  const client = request(`http://localhost:${APP_PORT}`);

  const req = client[method](`/rest${path}`).set(
    'Authorization',
    `Bearer ${bearer}`,
  );

  if (['post', 'patch', 'put'].includes(method)) {
    req.set('Content-Type', 'application/json').send(JSON.stringify(body));
  }

  return req;
};
