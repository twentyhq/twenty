import { assertUnreachable } from 'twenty-shared/utils';

import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  PermissionFlagDefinitionException,
  PermissionFlagDefinitionExceptionCode,
} from 'src/engine/metadata-modules/permission-flag-definition/permission-flag-definition.exception';

export const permissionFlagDefinitionGraphqlApiExceptionHandler = (
  error: Error,
) => {
  if (error instanceof PermissionFlagDefinitionException) {
    switch (error.code) {
      case PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_NOT_FOUND:
        throw new NotFoundError(error);
      case PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_ALREADY_EXISTS:
        throw new ConflictError(error);
      case PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_IS_STANDARD:
        throw new ForbiddenError(error);
      case PermissionFlagDefinitionExceptionCode.INVALID_PERMISSION_FLAG_DEFINITION_INPUT:
      case PermissionFlagDefinitionExceptionCode.INVALID_PERMISSION_FLAG_DEFINITION_KEY:
      case PermissionFlagDefinitionExceptionCode.INVALID_PERMISSION_FLAG_DEFINITION_CATEGORY:
      case PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_KEY_IMMUTABLE:
      case PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_APPLICATION_IMMUTABLE:
      case PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_IN_USE:
        throw new UserInputError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
