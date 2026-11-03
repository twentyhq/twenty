import { type Response } from 'supertest';
import { type Api } from 'test/integration/permissions/utils/person-api.util';

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
  api: Api;
  response: Response;
}) => {
  if (api === 'graphql') {
    expectPermissionDenied(response.body.errors);

    return;
  }

  // Should be 403: RestApiExceptionFilter maps every non-HTTP exception to 400.
  expect(response.status).toBe(400);
  expect(response.body.code).toBe(PermissionsExceptionCode.PERMISSION_DENIED);
  expect(response.body.messages).toStrictEqual([
    PermissionsExceptionMessage.PERMISSION_DENIED,
  ]);
};

export const expectSuccessfulResponse = ({
  api,
  response,
}: {
  api: Api;
  response: Response;
}) => {
  if (api === 'graphql') {
    expect(response.body.errors).toBeUndefined();

    return;
  }

  expect([200, 201]).toContain(response.status);
};
