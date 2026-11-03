import { type Response } from 'supertest';
import { type RecordApi } from 'test/integration/utils/person-requests-by-api.util';

import {
  type BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';

export const expectPermissionDenied = (errors: BaseGraphQLError[]) => {
  expect(errors).toHaveLength(1);
  expect(errors[0].message).toBe(PermissionsExceptionMessage.PERMISSION_DENIED);
  expect(errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
};

export const expectPermissionDeniedResponse = ({
  api,
  response,
}: {
  api: RecordApi;
  response: Response;
}) => {
  if (api === 'graphql') {
    expectPermissionDenied(response.body.errors);

    return;
  }

  expect(response.status).toBe(403);
  expect(response.body.code).toBe(PermissionsExceptionCode.PERMISSION_DENIED);
  expect(response.body.messages).toStrictEqual([
    PermissionsExceptionMessage.PERMISSION_DENIED,
  ]);
};
