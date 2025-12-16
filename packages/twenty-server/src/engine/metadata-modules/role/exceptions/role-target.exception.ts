import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum RoleTargetExceptionCode {
  ROLE_TARGET_NOT_FOUND = 'ROLE_TARGET_NOT_FOUND',
  INVALID_ROLE_TARGET_DATA = 'INVALID_ROLE_TARGET_DATA',
  ROLE_TARGET_MISSING_IDENTIFIER = 'ROLE_TARGET_MISSING_IDENTIFIER',
  ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY = 'ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY',
  ROLE_NOT_FOUND = 'ROLE_NOT_FOUND',
}

const roleTargetExceptionUserFriendlyMessages: Record<
  RoleTargetExceptionCode,
  MessageDescriptor
> = {
  [RoleTargetExceptionCode.ROLE_TARGET_NOT_FOUND]: msg`Role target not found.`,
  [RoleTargetExceptionCode.INVALID_ROLE_TARGET_DATA]: msg`Invalid role target data.`,
  [RoleTargetExceptionCode.ROLE_TARGET_MISSING_IDENTIFIER]: msg`Role target is missing identifier.`,
  [RoleTargetExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY]: msg`Role cannot be assigned to this entity.`,
  [RoleTargetExceptionCode.ROLE_NOT_FOUND]: msg`Role not found.`,
};

export class RoleTargetException extends CustomException<RoleTargetExceptionCode> {
  constructor(
    message: string,
    code: RoleTargetExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? roleTargetExceptionUserFriendlyMessages[code],
    });
  }
}
