import { CustomException } from 'src/utils/custom-exception';

export class PermissionsException extends CustomException {
  declare code: PermissionsExceptionCode;
  constructor(message: string, code: PermissionsExceptionCode) {
    super(message, code);
  }
}

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
  UNKNOWN_OPERATION_NAME = 'UNKNOWN_OPERATION_NAME',
  UNKNOWN_REQUIRED_PERMISSION = 'UNKNOWN_REQUIRED_PERMISSION',
  CANNOT_UPDATE_SELF_ROLE = 'CANNOT_UPDATE_SELF_ROLE',
  NO_ROLE_FOUND_FOR_USER_WORKSPACE = 'NO_ROLE_FOUND_FOR_USER_WORKSPACE',
  INVALID_ARG = 'INVALID_ARG',
  PERMISSIONS_V2_NOT_ENABLED = 'PERMISSIONS_V2_NOT_ENABLED',
  ROLE_LABEL_ALREADY_EXISTS = 'ROLE_LABEL_ALREADY_EXISTS',
  DEFAULT_ROLE_NOT_FOUND = 'DEFAULT_ROLE_NOT_FOUND',
  OBJECT_METADATA_NOT_FOUND = 'OBJECT_METADATA_NOT_FOUND',
  INVALID_SETTING = 'INVALID_SETTING',
  ROLE_NOT_EDITABLE = 'ROLE_NOT_EDITABLE',
  DEFAULT_ROLE_CANNOT_BE_DELETED = 'DEFAULT_ROLE_CANNOT_BE_DELETED',
}

export enum PermissionsExceptionMessage {
  PERMISSION_DENIED = 'User does not have permission',
  ADMIN_ROLE_NOT_FOUND = 'Admin role not found',
  USER_WORKSPACE_NOT_FOUND = 'User workspace not found',
  WORKSPACE_ID_ROLE_USER_WORKSPACE_MISMATCH = 'Workspace id role user workspace mismatch',
  TOO_MANY_ADMIN_CANDIDATES = 'Too many admin candidates',
  USER_WORKSPACE_ALREADY_HAS_ROLE = 'User workspace already has role',
  WORKSPACE_MEMBER_NOT_FOUND = 'Workspace member not found',
  ROLE_NOT_FOUND = 'Role not found',
  CANNOT_UNASSIGN_LAST_ADMIN = 'Cannot unassign admin role from last admin of the workspace',
  CANNOT_DELETE_LAST_ADMIN_USER = 'Cannot delete account: user is the unique admin of a workspace',
  UNKNOWN_OPERATION_NAME = 'Unknown operation name, cannot determine required permission',
  UNKNOWN_REQUIRED_PERMISSION = 'Unknown required permission',
  CANNOT_UPDATE_SELF_ROLE = 'Cannot update self role',
  NO_ROLE_FOUND_FOR_USER_WORKSPACE = 'No role found for userWorkspace',
  PERMISSIONS_V2_NOT_ENABLED = 'Permissions V2 is not enabled',
  ROLE_LABEL_ALREADY_EXISTS = 'A role with this label already exists',
  DEFAULT_ROLE_NOT_FOUND = 'Default role not found',
  OBJECT_METADATA_NOT_FOUND = 'Object metadata not found',
  INVALID_SETTING = 'Invalid permission setting (unknown value)',
  ROLE_NOT_EDITABLE = 'Role is not editable',
  DEFAULT_ROLE_CANNOT_BE_DELETED = 'Default role cannot be deleted',
}
