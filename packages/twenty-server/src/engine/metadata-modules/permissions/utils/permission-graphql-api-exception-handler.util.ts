import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UserInputError,
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
    case PermissionsExceptionCode.PERMISSIONS_V2_NOT_ENABLED:
    case PermissionsExceptionCode.ROLE_LABEL_ALREADY_EXISTS:
      throw new ForbiddenError(error.message);
    case PermissionsExceptionCode.INVALID_ARG:
      throw new UserInputError(error.message);
    case PermissionsExceptionCode.ROLE_NOT_FOUND:
    case PermissionsExceptionCode.USER_WORKSPACE_NOT_FOUND:
      throw new NotFoundError(error.message);
    case PermissionsExceptionCode.DEFAULT_ROLE_NOT_FOUND:
    default:
      throw new InternalServerError(error.message);
  }
};
