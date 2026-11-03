import {
  type BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/permissions/permissions.exception';

export const expectPermissionDenied = (errors: BaseGraphQLError[]) => {
  expect(errors).toHaveLength(1);
  expect(errors[0].message).toBe(PermissionsExceptionMessage.PERMISSION_DENIED);
  expect(errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
};

export const expectRestPermissionDenied = (response: {
  status: number;
  body: { messages?: string[] };
}) => {
  expect(response.status).toBe(403);
  expect(response.body.messages).toStrictEqual([
    PermissionsExceptionMessage.PERMISSION_DENIED,
  ]);
};
