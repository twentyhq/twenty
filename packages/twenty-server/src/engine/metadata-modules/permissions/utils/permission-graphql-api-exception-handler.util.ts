import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  type PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

export const permissionGraphqlApiExceptionHandler = (
  error: PermissionsException,
) => {
  switch (error.code) {
    case PermissionsExceptionCode.PERMISSION_DENIED:
      throw new ForbiddenError(error.message, {
        userFriendlyMessage: msg`User does not have permission.`,
        subCode: error.code,
      });
    case PermissionsExceptionCode.NO_AUTHENTICATION_CONTEXT:
      throw new ForbiddenError(error.message, {
        userFriendlyMessage: msg`No valid authentication context found.`,
        subCode: error.code,
      });
    case PermissionsExceptionCode.ROLE_LABEL_ALREADY_EXISTS:
      throw new ForbiddenError(error);
    case PermissionsExceptionCode.CANNOT_UNASSIGN_LAST_ADMIN:
    case PermissionsExceptionCode.CANNOT_UPDATE_SELF_ROLE:
    case PermissionsExceptionCode.CANNOT_DELETE_LAST_ADMIN_USER:
    case PermissionsExceptionCode.ROLE_NOT_EDITABLE:
    case PermissionsExceptionCode.CANNOT_ADD_OBJECT_PERMISSION_ON_SYSTEM_OBJECT:
    case PermissionsExceptionCode.CANNOT_ADD_FIELD_PERMISSION_ON_SYSTEM_OBJECT:
      throw new ForbiddenError(error);
    case PermissionsExceptionCode.INVALID_ARG:
    case PermissionsExceptionCode.INVALID_SETTING:
    case PermissionsExceptionCode.CANNOT_GIVE_WRITING_PERMISSION_ON_NON_READABLE_OBJECT:
    case PermissionsExceptionCode.CANNOT_GIVE_WRITING_PERMISSION_WITHOUT_READING_PERMISSION:
    case PermissionsExceptionCode.ONLY_FIELD_RESTRICTION_ALLOWED:
    case PermissionsExceptionCode.FIELD_RESTRICTION_ONLY_ALLOWED_ON_READABLE_OBJECT:
    case PermissionsExceptionCode.FIELD_RESTRICTION_ON_UPDATE_ONLY_ALLOWED_ON_UPDATABLE_OBJECT:
    case PermissionsExceptionCode.EMPTY_FIELD_PERMISSION_NOT_ALLOWED:
    case PermissionsExceptionCode.ROLE_MUST_HAVE_AT_LEAST_ONE_TARGET:
    case PermissionsExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_USERS:
      throw new UserInputError(error);
    case PermissionsExceptionCode.ROLE_NOT_FOUND:
    case PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND:
    case PermissionsExceptionCode.FIELD_METADATA_NOT_FOUND:
    case PermissionsExceptionCode.PERMISSION_NOT_FOUND:
      throw new NotFoundError(error);
    case PermissionsExceptionCode.UPSERT_FIELD_PERMISSION_FAILED:
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
    case PermissionsExceptionCode.OBJECT_PERMISSION_NOT_FOUND:
    case PermissionsExceptionCode.API_KEY_ROLE_NOT_FOUND:
    case PermissionsExceptionCode.JOIN_COLUMN_NAME_REQUIRED:
    case PermissionsExceptionCode.COMPOSITE_TYPE_NOT_FOUND:
    case PermissionsExceptionCode.USER_WORKSPACE_NOT_FOUND:
      throw error;
    default: {
      return assertUnreachable(error.code);
    }
  }
};
