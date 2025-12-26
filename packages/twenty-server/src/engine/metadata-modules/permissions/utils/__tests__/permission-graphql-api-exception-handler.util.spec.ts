import {
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { permissionGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/permissions/utils/permission-graphql-api-exception-handler.util';

describe('permissionGraphqlApiExceptionHandler', () => {
  it('should throw ForbiddenError for PERMISSION_DENIED', () => {
    const exception = new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
    );

    expect(() => permissionGraphqlApiExceptionHandler(exception)).toThrow(
      ForbiddenError,
    );
  });

  it('should throw ForbiddenError for role-related forbidden cases', () => {
    const exception = new PermissionsException(
      'Cannot update self',
      PermissionsExceptionCode.CANNOT_UPDATE_SELF_ROLE,
    );

    expect(() => permissionGraphqlApiExceptionHandler(exception)).toThrow(
      ForbiddenError,
    );
  });

  it('should throw UserInputError for INVALID_ARG', () => {
    const exception = new PermissionsException(
      'Invalid argument',
      PermissionsExceptionCode.INVALID_ARG,
    );

    expect(() => permissionGraphqlApiExceptionHandler(exception)).toThrow(
      UserInputError,
    );
  });

  it('should throw UserInputError for permission validation errors', () => {
    const exception = new PermissionsException(
      'Empty field permission',
      PermissionsExceptionCode.EMPTY_FIELD_PERMISSION_NOT_ALLOWED,
    );

    expect(() => permissionGraphqlApiExceptionHandler(exception)).toThrow(
      UserInputError,
    );
  });

  it('should throw NotFoundError for ROLE_NOT_FOUND', () => {
    const exception = new PermissionsException(
      'Role not found',
      PermissionsExceptionCode.ROLE_NOT_FOUND,
    );

    expect(() => permissionGraphqlApiExceptionHandler(exception)).toThrow(
      NotFoundError,
    );
  });

  it('should throw NotFoundError for metadata not found cases', () => {
    const exception = new PermissionsException(
      'Object metadata not found',
      PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
    );

    expect(() => permissionGraphqlApiExceptionHandler(exception)).toThrow(
      NotFoundError,
    );
  });

  it('should rethrow exception for METHOD_NOT_ALLOWED', () => {
    const exception = new PermissionsException(
      'Method not allowed',
      PermissionsExceptionCode.METHOD_NOT_ALLOWED,
    );

    expect(() => permissionGraphqlApiExceptionHandler(exception)).toThrow(
      exception,
    );
  });

  it('should rethrow exception for internal error codes', () => {
    const exception = new PermissionsException(
      'Default role not found',
      PermissionsExceptionCode.DEFAULT_ROLE_NOT_FOUND,
    );

    expect(() => permissionGraphqlApiExceptionHandler(exception)).toThrow(
      exception,
    );
  });
});
