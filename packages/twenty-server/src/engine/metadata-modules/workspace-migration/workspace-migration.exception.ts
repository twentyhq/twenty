import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum WorkspaceMigrationExceptionCode {
  NO_FACTORY_FOUND = 'NO_FACTORY_FOUND',
  INVALID_ACTION = 'INVALID_ACTION',
  INVALID_FIELD_METADATA = 'INVALID_FIELD_METADATA',
  INVALID_COMPOSITE_TYPE = 'INVALID_COMPOSITE_TYPE',
  ENUM_TYPE_NAME_NOT_FOUND = 'ENUM_TYPE_NAME_NOT_FOUND',
}

const getWorkspaceMigrationExceptionUserFriendlyMessage = (
  code: WorkspaceMigrationExceptionCode,
) => {
  switch (code) {
    case WorkspaceMigrationExceptionCode.NO_FACTORY_FOUND:
      return msg`Migration factory not found.`;
    case WorkspaceMigrationExceptionCode.INVALID_ACTION:
      return msg`Invalid migration action.`;
    case WorkspaceMigrationExceptionCode.INVALID_FIELD_METADATA:
      return msg`Invalid field metadata.`;
    case WorkspaceMigrationExceptionCode.INVALID_COMPOSITE_TYPE:
      return msg`Invalid composite type.`;
    case WorkspaceMigrationExceptionCode.ENUM_TYPE_NAME_NOT_FOUND:
      return msg`Enum type not found.`;
    default:
      assertUnreachable(code);
  }
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
        getWorkspaceMigrationExceptionUserFriendlyMessage(code),
    });
  }
}
