import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type WorkspaceMigrationV2ExceptionCode } from 'twenty-shared/metadata';

import { CustomException } from 'src/utils/custom-exception';

const workspaceMigrationV2ExceptionUserFriendlyMessages: Partial<
  Record<WorkspaceMigrationV2ExceptionCode, MessageDescriptor>
> = {};

const defaultUserFriendlyMessage = msg`An error occurred during workspace migration.`;

export class WorkspaceMigrationV2Exception extends CustomException<WorkspaceMigrationV2ExceptionCode> {
  constructor(
    message: string,
    code: WorkspaceMigrationV2ExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        workspaceMigrationV2ExceptionUserFriendlyMessages[code] ??
        defaultUserFriendlyMessage,
    });
  }
}
