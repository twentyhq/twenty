import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const WorkspaceMigrationRunnerExceptionCode = appendCommonExceptionCode({
  FIELD_METADATA_NOT_FOUND: 'FIELD_METADATA_NOT_FOUND',
  OBJECT_METADATA_NOT_FOUND: 'OBJECT_METADATA_NOT_FOUND',
  ENUM_OPERATION_FAILED: 'ENUM_OPERATION_FAILED',
  UNSUPPORTED_COMPOSITE_COLUMN_TYPE: 'UNSUPPORTED_COMPOSITE_COLUMN_TYPE',
  NOT_SUPPORTED: 'NOT_SUPPORTED',
  INVALID_ACTION_TYPE: 'INVALID_ACTION_TYPE',
  FLAT_ENTITY_NOT_FOUND: 'FLAT_ENTITY_NOT_FOUND',
} as const);

const getWorkspaceMigrationRunnerExceptionUserFriendlyMessage = (
  code: keyof typeof WorkspaceMigrationRunnerExceptionCode,
) => {
  switch (code) {
    case WorkspaceMigrationRunnerExceptionCode.FIELD_METADATA_NOT_FOUND:
      return msg`Field metadata not found.`;
    case WorkspaceMigrationRunnerExceptionCode.OBJECT_METADATA_NOT_FOUND:
      return msg`Object metadata not found.`;
    case WorkspaceMigrationRunnerExceptionCode.ENUM_OPERATION_FAILED:
      return msg`Enum operation failed.`;
    case WorkspaceMigrationRunnerExceptionCode.UNSUPPORTED_COMPOSITE_COLUMN_TYPE:
      return msg`Unsupported composite column type.`;
    case WorkspaceMigrationRunnerExceptionCode.NOT_SUPPORTED:
      return msg`This operation is not supported.`;
    case WorkspaceMigrationRunnerExceptionCode.INVALID_ACTION_TYPE:
      return msg`Invalid action type.`;
    case WorkspaceMigrationRunnerExceptionCode.FLAT_ENTITY_NOT_FOUND:
      return msg`Entity not found.`;
    case WorkspaceMigrationRunnerExceptionCode.INTERNAL_SERVER_ERROR:
      return msg`An unexpected error occurred.`;
    default:
      assertUnreachable(code);
  }
};

export class WorkspaceMigrationRunnerException extends CustomException<
  keyof typeof WorkspaceMigrationRunnerExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof WorkspaceMigrationRunnerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getWorkspaceMigrationRunnerExceptionUserFriendlyMessage(code),
    });
  }
}
