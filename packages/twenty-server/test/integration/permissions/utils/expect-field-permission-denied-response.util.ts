import { type Response } from 'supertest';
import { type RecordApi } from 'test/integration/utils/person-requests-by-api.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';

export const expectFieldPermissionDeniedResponse = ({
  api,
  response,
  access,
  objectNameSingular,
  fieldName,
}: {
  api: RecordApi;
  response: Response;
  access: 'read' | 'write';
  objectNameSingular: string;
  fieldName: string;
}) => {
  const message = `${PermissionsExceptionMessage.PERMISSION_DENIED}: no permission to ${access} field "${fieldName}" on "${objectNameSingular}"`;

  if (api === 'graphql') {
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].message).toBe(message);
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);

    for (const result of Object.values(response.body.data ?? {})) {
      expect(result).toBeNull();
    }

    return;
  }

  expect(response.status).toBe(403);
  expect(response.body.code).toBe(PermissionsExceptionCode.PERMISSION_DENIED);
  expect(response.body.messages).toStrictEqual([message]);
};
