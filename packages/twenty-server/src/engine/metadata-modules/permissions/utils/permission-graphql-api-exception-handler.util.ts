import {
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { CustomException } from 'src/utils/custom-exception';

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
    case PermissionsExceptionCode.ROLE_NOT_EDITABLE:
      throw new ForbiddenError(error.message);
    case PermissionsExceptionCode.INVALID_ARG:
    case PermissionsExceptionCode.INVALID_SETTING:
      throw new UserInputError(error.message);
    case PermissionsExceptionCode.ROLE_NOT_FOUND:
    case PermissionsExceptionCode.USER_WORKSPACE_NOT_FOUND:
    case PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND:
      throw new NotFoundError(error.message);
    case PermissionsExceptionCode.DEFAULT_ROLE_NOT_FOUND:
    default:
      throw new CustomException(error.message, error.code);
  }
};
