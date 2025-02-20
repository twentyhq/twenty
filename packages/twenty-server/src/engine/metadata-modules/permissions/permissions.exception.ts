import { CustomException } from 'src/utils/custom-exception';

export class PermissionsException extends CustomException {
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
  UNKNOWN_OPERATION_NAME = 'UNKNOWN_OPERATION_NAME',
  UNKNOWN_REQUIRED_PERMISSION = 'UNKNOWN_REQUIRED_PERMISSION',
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
  CANNOT_UNASSIGN_LAST_ADMIN = 'Cannot unassign last admin',
  UNKNOWN_OPERATION_NAME = 'Unknown operation name, cannot determine required permission',
  UNKNOWN_REQUIRED_PERMISSION = 'Unknown required permission',
}
