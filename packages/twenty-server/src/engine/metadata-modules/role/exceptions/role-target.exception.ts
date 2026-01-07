import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum RoleTargetExceptionCode {
  ROLE_TARGET_NOT_FOUND = 'ROLE_TARGET_NOT_FOUND',
  INVALID_ROLE_TARGET_DATA = 'INVALID_ROLE_TARGET_DATA',
  ROLE_TARGET_MISSING_IDENTIFIER = 'ROLE_TARGET_MISSING_IDENTIFIER',
  ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY = 'ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY',
  ROLE_NOT_FOUND = 'ROLE_NOT_FOUND',
}

const getRoleTargetExceptionUserFriendlyMessage = (
  code: RoleTargetExceptionCode,
) => {
  switch (code) {
    case RoleTargetExceptionCode.ROLE_TARGET_NOT_FOUND:
      return msg`Role target not found.`;
    case RoleTargetExceptionCode.INVALID_ROLE_TARGET_DATA:
      return msg`Invalid role target data.`;
    case RoleTargetExceptionCode.ROLE_TARGET_MISSING_IDENTIFIER:
      return msg`Role target is missing identifier.`;
    case RoleTargetExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY:
      return msg`Role cannot be assigned to this entity.`;
    case RoleTargetExceptionCode.ROLE_NOT_FOUND:
      return msg`Role not found.`;
    default:
      assertUnreachable(code);
  }
};

export class RoleTargetException extends CustomException<RoleTargetExceptionCode> {
  constructor(
    message: string,
    code: RoleTargetExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getRoleTargetExceptionUserFriendlyMessage(code),
    });
  }
}
