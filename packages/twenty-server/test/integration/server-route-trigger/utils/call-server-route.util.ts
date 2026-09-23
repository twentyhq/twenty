import request, { type Response } from 'supertest';
import { isDefined } from 'twenty-shared/utils';

type ServerRouteHttpMethod = 'get' | 'post' | 'head';

export const callServerRoute = async ({
  identifier,
  method = 'post',
  body = {},
  query,
  expectToFail = false,
}: {
  identifier: string;
  method?: ServerRouteHttpMethod;
  body?: object;
  query?: Record<string, string>;
  expectToFail?: boolean;
}): Promise<Response> => {
  const client = request(`http://localhost:${APP_PORT}`);

  let pendingRequest = client[method](`/webhooks/server/${identifier}`);

  if (isDefined(query)) {
    pendingRequest = pendingRequest.query(query);
  }

  if (method === 'post') {
    pendingRequest = pendingRequest.send(body);
  }

  const response = await pendingRequest;

  if (expectToFail === true) {
    expect(response.status).toBeGreaterThanOrEqual(400);
  }

  if (expectToFail === false) {
    expect(response.status).toBeLessThan(400);
  }

  return response;
};
