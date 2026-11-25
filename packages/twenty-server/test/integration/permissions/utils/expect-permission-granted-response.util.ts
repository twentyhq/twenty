import { type Response } from 'supertest';
import { type RecordApi } from 'test/integration/utils/person-requests-by-api.util';

export const expectPermissionGrantedResponse = ({
  api,
  response,
}: {
  api: RecordApi;
  response: Response;
}) => {
  if (api === 'graphql') {
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Object.values(response.body.data)).not.toContain(null);

    return;
  }

  expect([200, 201]).toContain(response.status);
  expect(response.body.data).toEqual(expect.anything());
};
