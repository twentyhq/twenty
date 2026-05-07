import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum PermissionFlagDefinitionExceptionCode {
  PERMISSION_FLAG_DEFINITION_NOT_FOUND = 'PERMISSION_FLAG_DEFINITION_NOT_FOUND',
  PERMISSION_FLAG_DEFINITION_ALREADY_EXISTS = 'PERMISSION_FLAG_DEFINITION_ALREADY_EXISTS',
  INVALID_PERMISSION_FLAG_DEFINITION_INPUT = 'INVALID_PERMISSION_FLAG_DEFINITION_INPUT',
  INVALID_PERMISSION_FLAG_DEFINITION_KEY = 'INVALID_PERMISSION_FLAG_DEFINITION_KEY',
  INVALID_PERMISSION_FLAG_DEFINITION_PERMISSION_TYPE = 'INVALID_PERMISSION_FLAG_DEFINITION_PERMISSION_TYPE',
  PERMISSION_FLAG_DEFINITION_KEY_IMMUTABLE = 'PERMISSION_FLAG_DEFINITION_KEY_IMMUTABLE',
  PERMISSION_FLAG_DEFINITION_APPLICATION_IMMUTABLE = 'PERMISSION_FLAG_DEFINITION_APPLICATION_IMMUTABLE',
  PERMISSION_FLAG_DEFINITION_IS_STANDARD = 'PERMISSION_FLAG_DEFINITION_IS_STANDARD',
  PERMISSION_FLAG_DEFINITION_IN_USE = 'PERMISSION_FLAG_DEFINITION_IN_USE',
}

const getPermissionFlagDefinitionExceptionUserFriendlyMessage = (
  code: PermissionFlagDefinitionExceptionCode,
) => {
  switch (code) {
    case PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_NOT_FOUND:
      return msg`Permission flag definition not found.`;
    case PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_ALREADY_EXISTS:
      return msg`Permission flag definition already exists.`;
    case PermissionFlagDefinitionExceptionCode.INVALID_PERMISSION_FLAG_DEFINITION_INPUT:
      return msg`Invalid permission flag definition input.`;
    case PermissionFlagDefinitionExceptionCode.INVALID_PERMISSION_FLAG_DEFINITION_KEY:
      return msg`Invalid permission flag definition key.`;
    case PermissionFlagDefinitionExceptionCode.INVALID_PERMISSION_FLAG_DEFINITION_PERMISSION_TYPE:
      return msg`Invalid permission flag definition permission type.`;
    case PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_KEY_IMMUTABLE:
      return msg`Permission flag definition key cannot be changed.`;
    case PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_APPLICATION_IMMUTABLE:
      return msg`Permission flag definition application owner cannot be changed.`;
    case PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_IS_STANDARD:
      return msg`Standard permission flag definitions cannot be modified.`;
    case PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_IN_USE:
      return msg`Permission flag definition is still assigned to a role.`;
    default:
      assertUnreachable(code);
  }
};

export class PermissionFlagDefinitionException extends CustomException<PermissionFlagDefinitionExceptionCode> {
  constructor(
    message: string,
    code: PermissionFlagDefinitionExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getPermissionFlagDefinitionExceptionUserFriendlyMessage(code),
    });
  }
}
