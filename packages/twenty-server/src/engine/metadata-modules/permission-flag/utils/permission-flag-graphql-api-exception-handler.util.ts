import { assertUnreachable } from 'twenty-shared/utils';

import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  PermissionFlagException,
  PermissionFlagExceptionCode,
} from 'src/engine/metadata-modules/permission-flag/permission-flag.exception';

export const permissionFlagGraphqlApiExceptionHandler = (
  error: Error,
) => {
  if (error instanceof PermissionFlagException) {
    switch (error.code) {
      case PermissionFlagExceptionCode.PERMISSION_FLAG_NOT_FOUND:
        throw new NotFoundError(error);
      case PermissionFlagExceptionCode.PERMISSION_FLAG_ALREADY_EXISTS:
        throw new ConflictError(error);
      case PermissionFlagExceptionCode.PERMISSION_FLAG_IS_STANDARD:
        throw new ForbiddenError(error);
      case PermissionFlagExceptionCode.INVALID_PERMISSION_FLAG_INPUT:
      case PermissionFlagExceptionCode.INVALID_PERMISSION_FLAG_KEY:
      case PermissionFlagExceptionCode.INVALID_PERMISSION_FLAG_PERMISSION_TYPE:
      case PermissionFlagExceptionCode.PERMISSION_FLAG_KEY_IMMUTABLE:
      case PermissionFlagExceptionCode.PERMISSION_FLAG_APPLICATION_IMMUTABLE:
      case PermissionFlagExceptionCode.PERMISSION_FLAG_IN_USE:
        throw new UserInputError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
