import request from 'supertest';

export type RestApiRequestMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

interface RestApiRequestParams {
  method: RestApiRequestMethod;
  path: string;
  bearer?: string;
  body?: any;
}

export const makeRestApiRequest = ({
  method,
  path,
  bearer = API_KEY_ACCESS_TOKEN,
  body = {},
}: RestApiRequestParams) => {
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
