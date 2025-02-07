import {
  ForbiddenError,
  InternalServerError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

export const permissionsGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof PermissionsException) {
    switch (error.code) {
      case PermissionsExceptionCode.PERMISSION_DENIED:
      case PermissionsExceptionCode.CANNOT_UNASSIGN_LAST_ADMIN:
        throw new ForbiddenError(error.message);
      default:
        throw new InternalServerError(error.message);
    }
  }

  throw error;
};
