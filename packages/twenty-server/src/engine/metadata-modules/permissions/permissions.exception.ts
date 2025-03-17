import { PermissionsExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class PermissionsException extends CustomException {
  constructor(message: string, code: PermissionsExceptionCode) {
    super(message, code);
  }
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
}
