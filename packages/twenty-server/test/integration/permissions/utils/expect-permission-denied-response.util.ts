import { type Response } from 'supertest';
import { expectPermissionDenied } from 'test/integration/permissions/utils/expect-permission-denied.util';
import { type RecordApi } from 'test/integration/utils/person-requests-by-api.util';

import {
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';

export const expectPermissionDeniedResponse = ({
  api,
  response,
}: {
  api: RecordApi;
  response: Response;
}) => {
  if (api === 'graphql') {
    expectPermissionDenied(response.body.errors);

    for (const result of Object.values(response.body.data ?? {})) {
      expect(result).toBeNull();
    }

    return;
  }

  expect(response.status).toBe(403);
  expect(response.body.data).toBeUndefined();
  expect(response.body.code).toBe(PermissionsExceptionCode.PERMISSION_DENIED);
  expect(response.body.messages).toStrictEqual([
    PermissionsExceptionMessage.PERMISSION_DENIED,
  ]);
};
