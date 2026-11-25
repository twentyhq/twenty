import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { permissionGraphqlApiExceptionHandler } from 'src/engine/permissions/utils/permission-graphql-api-exception-handler.util';
import { permissionRestApiExceptionCodeToHttpStatus } from 'src/engine/permissions/utils/permission-rest-api-exception-code-to-http-status.util';

describe('permission exception record access codes', () => {
  it.each([
    PermissionsExceptionCode.RLS_VALIDATION_FAILED,
    PermissionsExceptionCode.RECORD_PERMISSION_QUERY_INVALID,
  ])('treats %s as a user input error', (code) => {
    const error = new PermissionsException('message', code);

    expect(() => permissionGraphqlApiExceptionHandler(error)).toThrow(
      UserInputError,
    );
    expect(permissionRestApiExceptionCodeToHttpStatus(code)).toBe(400);
  });

  it.each([
    PermissionsExceptionCode.RLS_PREDICATE_FIELD_NOT_FOUND,
    PermissionsExceptionCode.RECORD_PERMISSION_QUERY_FAILED,
  ])('treats %s as a server error', (code) => {
    const error = new PermissionsException('message', code);

    expect(() => permissionGraphqlApiExceptionHandler(error)).toThrow(error);
    expect(permissionRestApiExceptionCodeToHttpStatus(code)).toBe(500);
  });
});
