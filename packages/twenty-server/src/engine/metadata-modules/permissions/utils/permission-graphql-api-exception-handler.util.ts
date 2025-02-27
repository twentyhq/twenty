import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

export const permissionGraphqlApiExceptionHandler = (
  error: PermissionsException,
) => {
  switch (error.code) {
    case PermissionsExceptionCode.PERMISSION_DENIED:
    case PermissionsExceptionCode.CANNOT_UNASSIGN_LAST_ADMIN:
    case PermissionsExceptionCode.CANNOT_UPDATE_SELF_ROLE:
    case PermissionsExceptionCode.CANNOT_DELETE_LAST_ADMIN_USER:
      throw new ForbiddenError(error.message);
    case PermissionsExceptionCode.ROLE_NOT_FOUND:
    case PermissionsExceptionCode.USER_WORKSPACE_NOT_FOUND:
      throw new NotFoundError(error.message);
    default:
      throw new InternalServerError(error.message);
  }
};
