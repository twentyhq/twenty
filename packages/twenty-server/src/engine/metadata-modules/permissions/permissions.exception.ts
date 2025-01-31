import { CustomException } from 'src/utils/custom-exception';

export class PermissionsException extends CustomException {
  code: PermissionsExceptionCode;
  constructor(message: string, code: PermissionsExceptionCode) {
    super(message, code);
  }
}

export enum PermissionsExceptionCode {
  ADMIN_ROLE_NOT_FOUND = 'ADMIN_ROLE_NOT_FOUND',
  USER_WORKSPACE_NOT_FOUND = 'USER_WORKSPACE_NOT_FOUND',
  WORKSPACE_ID_ROLE_USER_WORKSPACE_MISMATCH = 'WORKSPACE_ID_ROLE_USER_WORKSPACE_MISMATCH',
  TOO_MANY_ADMIN_CANDIDATES = 'TOO_MANY_ADMIN_CANDIDATES',
  USER_WORKSPACE_ALREADY_HAS_ROLE = 'USER_WORKSPACE_ALREADY_HAS_ROLE',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
}
