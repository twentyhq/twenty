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
    expect(response.body.errors).toBeUndefined();

    return;
  }

  expect([200, 201]).toContain(response.status);
};
