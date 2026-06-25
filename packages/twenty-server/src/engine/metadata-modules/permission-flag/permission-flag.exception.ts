import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum PermissionFlagExceptionCode {
  PERMISSION_FLAG_NOT_FOUND = 'PERMISSION_FLAG_NOT_FOUND',
  PERMISSION_FLAG_ALREADY_EXISTS = 'PERMISSION_FLAG_ALREADY_EXISTS',
  INVALID_PERMISSION_FLAG_KEY = 'INVALID_PERMISSION_FLAG_KEY',
  INVALID_PERMISSION_FLAG_PERMISSION_TYPE = 'INVALID_PERMISSION_FLAG_PERMISSION_TYPE',
  PERMISSION_FLAG_KEY_IMMUTABLE = 'PERMISSION_FLAG_KEY_IMMUTABLE',
  PERMISSION_FLAG_IS_STANDARD = 'PERMISSION_FLAG_IS_STANDARD',
  PERMISSION_FLAG_IN_USE = 'PERMISSION_FLAG_IN_USE',
}

const getPermissionFlagExceptionUserFriendlyMessage = (
  code: PermissionFlagExceptionCode,
) => {
  switch (code) {
    case PermissionFlagExceptionCode.PERMISSION_FLAG_NOT_FOUND:
      return msg`Permission flag not found.`;
    case PermissionFlagExceptionCode.PERMISSION_FLAG_ALREADY_EXISTS:
      return msg`Permission flag already exists.`;
    case PermissionFlagExceptionCode.INVALID_PERMISSION_FLAG_KEY:
      return msg`Invalid permission flag key.`;
    case PermissionFlagExceptionCode.INVALID_PERMISSION_FLAG_PERMISSION_TYPE:
      return msg`Invalid permission flag permission type.`;
    case PermissionFlagExceptionCode.PERMISSION_FLAG_KEY_IMMUTABLE:
      return msg`Permission flag key cannot be changed.`;
    case PermissionFlagExceptionCode.PERMISSION_FLAG_IS_STANDARD:
      return msg`Standard permission flags cannot be modified.`;
    case PermissionFlagExceptionCode.PERMISSION_FLAG_IN_USE:
      return msg`Permission flag is still assigned to a role.`;
    default:
      assertUnreachable(code);
  }
};

export class PermissionFlagException extends CustomException<PermissionFlagExceptionCode> {
  constructor(
    message: string,
    code: PermissionFlagExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getPermissionFlagExceptionUserFriendlyMessage(code),
    });
  }
}
