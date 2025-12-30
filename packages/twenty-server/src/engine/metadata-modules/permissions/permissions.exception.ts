import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum PermissionsExceptionCode {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  ADMIN_ROLE_NOT_FOUND = 'ADMIN_ROLE_NOT_FOUND',
  USER_WORKSPACE_NOT_FOUND = 'USER_WORKSPACE_NOT_FOUND',
  WORKSPACE_ID_ROLE_USER_WORKSPACE_MISMATCH = 'WORKSPACE_ID_ROLE_USER_WORKSPACE_MISMATCH',
  TOO_MANY_ADMIN_CANDIDATES = 'TOO_MANY_ADMIN_CANDIDATES',
  USER_WORKSPACE_ALREADY_HAS_ROLE = 'USER_WORKSPACE_ALREADY_HAS_ROLE',
  WORKSPACE_MEMBER_NOT_FOUND = 'WORKSPACE_MEMBER_NOT_FOUND',
  ROLE_NOT_FOUND = 'ROLE_NOT_FOUND',
  CANNOT_UNASSIGN_LAST_ADMIN = 'CANNOT_UNASSIGN_LAST_ADMIN',
  CANNOT_DELETE_LAST_ADMIN_USER = 'CANNOT_DELETE_LAST_ADMIN_USER',
  UNKNOWN_OPERATION_NAME = 'UNKNOWN_OPERATION_NAME_PERMISSIONS',
  UNKNOWN_REQUIRED_PERMISSION = 'UNKNOWN_REQUIRED_PERMISSION',
  CANNOT_UPDATE_SELF_ROLE = 'CANNOT_UPDATE_SELF_ROLE',
  NO_ROLE_FOUND_FOR_USER_WORKSPACE = 'NO_ROLE_FOUND_FOR_USER_WORKSPACE',
  API_KEY_ROLE_NOT_FOUND = 'API_KEY_ROLE_NOT_FOUND',
  NO_AUTHENTICATION_CONTEXT = 'NO_AUTHENTICATION_CONTEXT',
  INVALID_ARG = 'INVALID_ARG_PERMISSIONS',
  ROLE_LABEL_ALREADY_EXISTS = 'ROLE_LABEL_ALREADY_EXISTS',
  DEFAULT_ROLE_NOT_FOUND = 'DEFAULT_ROLE_NOT_FOUND',
  OBJECT_METADATA_NOT_FOUND = 'OBJECT_METADATA_NOT_FOUND_PERMISSIONS',
  INVALID_SETTING = 'INVALID_SETTING_PERMISSIONS',
  ROLE_NOT_EDITABLE = 'ROLE_NOT_EDITABLE',
  DEFAULT_ROLE_CANNOT_BE_DELETED = 'DEFAULT_ROLE_CANNOT_BE_DELETED',
  NO_PERMISSIONS_FOUND_IN_DATASOURCE = 'NO_PERMISSIONS_FOUND_IN_DATASOURCE',
  CANNOT_ADD_OBJECT_PERMISSION_ON_SYSTEM_OBJECT = 'CANNOT_ADD_OBJECT_PERMISSION_ON_SYSTEM_OBJECT',
  CANNOT_ADD_FIELD_PERMISSION_ON_SYSTEM_OBJECT = 'CANNOT_ADD_FIELD_PERMISSION_ON_SYSTEM_OBJECT',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  RAW_SQL_NOT_ALLOWED = 'RAW_SQL_NOT_ALLOWED',
  CANNOT_GIVE_WRITING_PERMISSION_ON_NON_READABLE_OBJECT = 'CANNOT_GIVE_WRITING_PERMISSION_ON_NON_READABLE_OBJECT',
  CANNOT_GIVE_WRITING_PERMISSION_WITHOUT_READING_PERMISSION = 'CANNOT_GIVE_WRITING_PERMISSION_WITHOUT_READING_PERMISSION',
  FIELD_METADATA_NOT_FOUND = 'FIELD_METADATA_NOT_FOUND',
  ONLY_FIELD_RESTRICTION_ALLOWED = 'ONLY_FIELD_RESTRICTION_ALLOWED',
  FIELD_RESTRICTION_ONLY_ALLOWED_ON_READABLE_OBJECT = 'FIELD_RESTRICTION_ONLY_ALLOWED_ON_READABLE_OBJECT',
  FIELD_RESTRICTION_ON_UPDATE_ONLY_ALLOWED_ON_UPDATABLE_OBJECT = 'FIELD_RESTRICTION_ON_UPDATE_ONLY_ALLOWED_ON_UPDATABLE_OBJECT',
  UPSERT_FIELD_PERMISSION_FAILED = 'UPSERT_FIELD_PERMISSION_FAILED',
  PERMISSION_NOT_FOUND = 'PERMISSION_NOT_FOUND',
  OBJECT_PERMISSION_NOT_FOUND = 'OBJECT_PERMISSION_NOT_FOUND',
  EMPTY_FIELD_PERMISSION_NOT_ALLOWED = 'EMPTY_FIELD_PERMISSION_NOT_ALLOWED',
  JOIN_COLUMN_NAME_REQUIRED = 'JOIN_COLUMN_NAME_REQUIRED',
  COMPOSITE_TYPE_NOT_FOUND = 'COMPOSITE_TYPE_NOT_FOUND',
  ROLE_MUST_HAVE_AT_LEAST_ONE_TARGET = 'ROLE_MUST_HAVE_AT_LEAST_ONE_TARGET',
  ROLE_CANNOT_BE_ASSIGNED_TO_USERS = 'ROLE_CANNOT_BE_ASSIGNED_TO_USERS',
}

const getPermissionsExceptionUserFriendlyMessage = (
  code: PermissionsExceptionCode,
) => {
  switch (code) {
    case PermissionsExceptionCode.PERMISSION_DENIED:
      return msg`You do not have permission to perform this action.`;
    case PermissionsExceptionCode.ADMIN_ROLE_NOT_FOUND:
      return msg`Admin role not found.`;
    case PermissionsExceptionCode.USER_WORKSPACE_NOT_FOUND:
      return msg`User workspace not found.`;
    case PermissionsExceptionCode.WORKSPACE_ID_ROLE_USER_WORKSPACE_MISMATCH:
      return msg`Workspace ID and role mismatch.`;
    case PermissionsExceptionCode.TOO_MANY_ADMIN_CANDIDATES:
      return msg`Too many admin candidates found.`;
    case PermissionsExceptionCode.USER_WORKSPACE_ALREADY_HAS_ROLE:
      return msg`User already has a role assigned.`;
    case PermissionsExceptionCode.WORKSPACE_MEMBER_NOT_FOUND:
      return msg`Workspace member not found.`;
    case PermissionsExceptionCode.ROLE_NOT_FOUND:
      return msg`Role not found.`;
    case PermissionsExceptionCode.CANNOT_UNASSIGN_LAST_ADMIN:
      return msg`Cannot remove the last admin from the workspace.`;
    case PermissionsExceptionCode.CANNOT_DELETE_LAST_ADMIN_USER:
      return msg`Cannot delete the last admin user.`;
    case PermissionsExceptionCode.UNKNOWN_OPERATION_NAME:
      return msg`Unknown operation.`;
    case PermissionsExceptionCode.UNKNOWN_REQUIRED_PERMISSION:
      return msg`Unknown permission required.`;
    case PermissionsExceptionCode.CANNOT_UPDATE_SELF_ROLE:
      return msg`You cannot update your own role.`;
    case PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE:
      return msg`No role found for this user in the workspace.`;
    case PermissionsExceptionCode.API_KEY_ROLE_NOT_FOUND:
      return msg`API key role not found.`;
    case PermissionsExceptionCode.NO_AUTHENTICATION_CONTEXT:
      return msg`Authentication is required.`;
    case PermissionsExceptionCode.INVALID_ARG:
      return msg`Invalid argument provided.`;
    case PermissionsExceptionCode.ROLE_LABEL_ALREADY_EXISTS:
      return msg`A role with this label already exists.`;
    case PermissionsExceptionCode.DEFAULT_ROLE_NOT_FOUND:
      return msg`Default role not found.`;
    case PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND:
      return msg`Object metadata not found.`;
    case PermissionsExceptionCode.INVALID_SETTING:
      return msg`Invalid permission setting.`;
    case PermissionsExceptionCode.ROLE_NOT_EDITABLE:
      return msg`This role cannot be edited.`;
    case PermissionsExceptionCode.DEFAULT_ROLE_CANNOT_BE_DELETED:
      return msg`The default role cannot be deleted.`;
    case PermissionsExceptionCode.NO_PERMISSIONS_FOUND_IN_DATASOURCE:
      return msg`No permissions found in datasource.`;
    case PermissionsExceptionCode.CANNOT_ADD_OBJECT_PERMISSION_ON_SYSTEM_OBJECT:
      return msg`Cannot add permissions on system objects.`;
    case PermissionsExceptionCode.CANNOT_ADD_FIELD_PERMISSION_ON_SYSTEM_OBJECT:
      return msg`Cannot add field permissions on system objects.`;
    case PermissionsExceptionCode.METHOD_NOT_ALLOWED:
      return msg`This method is not allowed.`;
    case PermissionsExceptionCode.RAW_SQL_NOT_ALLOWED:
      return msg`Raw SQL queries are not allowed.`;
    case PermissionsExceptionCode.CANNOT_GIVE_WRITING_PERMISSION_ON_NON_READABLE_OBJECT:
      return msg`Cannot give write permission on non-readable objects.`;
    case PermissionsExceptionCode.CANNOT_GIVE_WRITING_PERMISSION_WITHOUT_READING_PERMISSION:
      return msg`Cannot give write permission without read permission.`;
    case PermissionsExceptionCode.FIELD_METADATA_NOT_FOUND:
      return msg`Field metadata not found.`;
    case PermissionsExceptionCode.ONLY_FIELD_RESTRICTION_ALLOWED:
      return msg`Only field restrictions are allowed.`;
    case PermissionsExceptionCode.FIELD_RESTRICTION_ONLY_ALLOWED_ON_READABLE_OBJECT:
      return msg`Field restrictions only apply to readable objects.`;
    case PermissionsExceptionCode.FIELD_RESTRICTION_ON_UPDATE_ONLY_ALLOWED_ON_UPDATABLE_OBJECT:
      return msg`Update field restrictions only apply to updatable objects.`;
    case PermissionsExceptionCode.UPSERT_FIELD_PERMISSION_FAILED:
      return msg`Failed to update field permission.`;
    case PermissionsExceptionCode.PERMISSION_NOT_FOUND:
      return msg`Permission not found.`;
    case PermissionsExceptionCode.OBJECT_PERMISSION_NOT_FOUND:
      return msg`Object permission not found.`;
    case PermissionsExceptionCode.EMPTY_FIELD_PERMISSION_NOT_ALLOWED:
      return msg`Empty field permissions are not allowed.`;
    case PermissionsExceptionCode.JOIN_COLUMN_NAME_REQUIRED:
      return msg`Join column name is required.`;
    case PermissionsExceptionCode.COMPOSITE_TYPE_NOT_FOUND:
      return msg`Composite type not found.`;
    case PermissionsExceptionCode.ROLE_MUST_HAVE_AT_LEAST_ONE_TARGET:
      return msg`Role must have at least one target.`;
    case PermissionsExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_USERS:
      return msg`This role cannot be assigned to users.`;
    default:
      assertUnreachable(code);
  }
};

export class PermissionsException extends CustomException<PermissionsExceptionCode> {
  constructor(
    message: string,
    code: PermissionsExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getPermissionsExceptionUserFriendlyMessage(code),
    });
  }
}

export enum PermissionsExceptionMessage {
  PERMISSION_DENIED = 'Entity performing the request does not have permission',
  USER_WORKSPACE_NOT_FOUND = 'User workspace not found',
  ROLE_NOT_FOUND = 'Role not found',
  CANNOT_UNASSIGN_LAST_ADMIN = 'Cannot unassign admin role from last admin of the workspace',
  CANNOT_DELETE_LAST_ADMIN_USER = 'Cannot delete account: user is the unique admin of a workspace',
  UNKNOWN_OPERATION_NAME = 'Unknown operation name, cannot determine required permission',
  CANNOT_UPDATE_SELF_ROLE = 'Cannot update self role',
  NO_ROLE_FOUND_FOR_USER_WORKSPACE = 'No role found for userWorkspace',
  API_KEY_ROLE_NOT_FOUND = 'API key has no role assigned',
  NO_AUTHENTICATION_CONTEXT = 'No valid authentication context found',
  ROLE_LABEL_ALREADY_EXISTS = 'A role with this label already exists',
  DEFAULT_ROLE_NOT_FOUND = 'Default role not found',
  OBJECT_METADATA_NOT_FOUND = 'Object metadata not found',
  INVALID_SETTING = 'Invalid permission setting (unknown value)',
  ROLE_NOT_EDITABLE = 'Role is not editable',
  DEFAULT_ROLE_CANNOT_BE_DELETED = 'Default role cannot be deleted',
  CANNOT_ADD_OBJECT_PERMISSION_ON_SYSTEM_OBJECT = 'Cannot add object permission on system object',
  CANNOT_ADD_FIELD_PERMISSION_ON_SYSTEM_OBJECT = 'Cannot add field permission on system object',
  CANNOT_GIVE_WRITING_PERMISSION_ON_NON_READABLE_OBJECT = 'Cannot give update permission to non-readable object',
  CANNOT_GIVE_WRITING_PERMISSION_WITHOUT_READING_PERMISSION = 'Cannot give writing permission without reading permission',
  FIELD_METADATA_NOT_FOUND = 'Field metadata not found',
  ONLY_FIELD_RESTRICTION_ALLOWED = 'Field permission can only introduce a restriction',
  FIELD_RESTRICTION_ONLY_ALLOWED_ON_READABLE_OBJECT = 'Field restriction only makes sense on readable object',
  FIELD_RESTRICTION_ON_UPDATE_ONLY_ALLOWED_ON_UPDATABLE_OBJECT = 'Field restriction on update only makes sense on updatable object',
  OBJECT_PERMISSION_NOT_FOUND = 'Object permission not found',
  EMPTY_FIELD_PERMISSION_NOT_ALLOWED = 'Empty field permission not allowed',
  ROLE_MUST_HAVE_AT_LEAST_ONE_TARGET = 'Role must be assignable to at least one target type',
  ROLE_CANNOT_BE_ASSIGNED_TO_USERS = 'Role cannot be assigned to users',
}
