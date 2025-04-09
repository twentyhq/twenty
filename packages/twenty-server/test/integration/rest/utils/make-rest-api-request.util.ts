import { IncomingHttpHeaders } from 'http';

import request from 'supertest';

export type RestAPIRequestMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

interface RestAPIRequestParams {
  method: RestAPIRequestMethod;
  path: string;
  headers?: IncomingHttpHeaders;
  body?: any;
}

export const makeRestAPIRequest = ({
  method,
  path,
  headers = {},
  body,
}: RestAPIRequestParams) => {
  const client = request(`http://localhost:${APP_PORT}`);

  return client[method](`/rest${path}`)
    .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
    .set(headers)
    .send(body ? JSON.stringify(body) : undefined);
};
