import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const WorkspaceSchemaManagerExceptionCode = appendCommonExceptionCode({
  ENUM_OPERATION_FAILED: 'ENUM_OPERATION_FAILED',
} as const);

const workspaceSchemaManagerExceptionUserFriendlyMessages: Record<
  keyof typeof WorkspaceSchemaManagerExceptionCode,
  MessageDescriptor
> = {
  ENUM_OPERATION_FAILED: msg`Schema enum operation failed.`,
  INTERNAL_SERVER_ERROR: msg`An unexpected error occurred.`,
};

export class WorkspaceSchemaManagerException extends CustomException<
  keyof typeof WorkspaceSchemaManagerExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof WorkspaceSchemaManagerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        workspaceSchemaManagerExceptionUserFriendlyMessages[code],
    });
  }
}
