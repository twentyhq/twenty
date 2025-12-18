import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum WorkspaceMigrationExceptionCode {
  NO_FACTORY_FOUND = 'NO_FACTORY_FOUND',
  INVALID_ACTION = 'INVALID_ACTION',
  INVALID_FIELD_METADATA = 'INVALID_FIELD_METADATA',
  INVALID_COMPOSITE_TYPE = 'INVALID_COMPOSITE_TYPE',
  ENUM_TYPE_NAME_NOT_FOUND = 'ENUM_TYPE_NAME_NOT_FOUND',
}

const workspaceMigrationExceptionUserFriendlyMessages: Record<
  WorkspaceMigrationExceptionCode,
  MessageDescriptor
> = {
  [WorkspaceMigrationExceptionCode.NO_FACTORY_FOUND]: msg`Migration factory not found.`,
  [WorkspaceMigrationExceptionCode.INVALID_ACTION]: msg`Invalid migration action.`,
  [WorkspaceMigrationExceptionCode.INVALID_FIELD_METADATA]: msg`Invalid field metadata.`,
  [WorkspaceMigrationExceptionCode.INVALID_COMPOSITE_TYPE]: msg`Invalid composite type.`,
  [WorkspaceMigrationExceptionCode.ENUM_TYPE_NAME_NOT_FOUND]: msg`Enum type not found.`,
};

export class WorkspaceMigrationException extends CustomException<WorkspaceMigrationExceptionCode> {
  constructor(
    message: string,
    code: WorkspaceMigrationExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        workspaceMigrationExceptionUserFriendlyMessages[code],
    });
  }
}
