import {
  ForbiddenError,
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
    case PermissionsExceptionCode.ROLE_NOT_EDITABLE:
    case PermissionsExceptionCode.CANNOT_ADD_OBJECT_PERMISSION_ON_SYSTEM_OBJECT:
      throw new ForbiddenError(error.message);
    case PermissionsExceptionCode.INVALID_ARG:
    case PermissionsExceptionCode.INVALID_SETTING:
    case PermissionsExceptionCode.CANNOT_GIVE_WRITING_PERMISSION_ON_NON_READABLE_OBJECT:
    case PermissionsExceptionCode.CANNOT_GIVE_WRITING_PERMISSION_WITHOUT_READING_PERMISSION:
      throw new UserInputError(error.message);
    case PermissionsExceptionCode.ROLE_NOT_FOUND:
    case PermissionsExceptionCode.USER_WORKSPACE_NOT_FOUND:
    case PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND:
      throw new NotFoundError(error.message);
    case PermissionsExceptionCode.DEFAULT_ROLE_NOT_FOUND:
    case PermissionsExceptionCode.WORKSPACE_ID_ROLE_USER_WORKSPACE_MISMATCH:
    case PermissionsExceptionCode.TOO_MANY_ADMIN_CANDIDATES:
    case PermissionsExceptionCode.USER_WORKSPACE_ALREADY_HAS_ROLE:
    case PermissionsExceptionCode.ADMIN_ROLE_NOT_FOUND:
    case PermissionsExceptionCode.DEFAULT_ROLE_CANNOT_BE_DELETED:
    case PermissionsExceptionCode.WORKSPACE_MEMBER_NOT_FOUND:
    case PermissionsExceptionCode.UNKNOWN_OPERATION_NAME:
    case PermissionsExceptionCode.UNKNOWN_REQUIRED_PERMISSION:
    case PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE:
    case PermissionsExceptionCode.NO_PERMISSIONS_FOUND_IN_DATASOURCE:
    case PermissionsExceptionCode.METHOD_NOT_ALLOWED:
    case PermissionsExceptionCode.RAW_SQL_NOT_ALLOWED:
      throw error;
    default: {
      const _exhaustiveCheck: never = error.code;

      throw error;
    }
  }
};
