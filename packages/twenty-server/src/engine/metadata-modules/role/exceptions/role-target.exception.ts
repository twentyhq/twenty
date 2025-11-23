import { CustomException } from 'src/utils/custom-exception';

export class RoleTargetException extends CustomException {
  code: RoleTargetExceptionCode;
  constructor(message: string, code: RoleTargetExceptionCode) {
    super(message, code);
  }
}

export enum RoleTargetExceptionCode {
  ROLE_TARGET_NOT_FOUND = 'ROLE_TARGET_NOT_FOUND',
  INVALID_ROLE_TARGET_DATA = 'INVALID_ROLE_TARGET_DATA',
  ROLE_TARGET_MISSING_IDENTIFIER = 'ROLE_TARGET_MISSING_IDENTIFIER',
}
