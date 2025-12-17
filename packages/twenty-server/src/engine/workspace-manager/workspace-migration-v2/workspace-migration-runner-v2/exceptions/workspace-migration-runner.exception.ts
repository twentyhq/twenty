import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

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

const workspaceMigrationRunnerExceptionUserFriendlyMessages: Record<
  keyof typeof WorkspaceMigrationRunnerExceptionCode,
  MessageDescriptor
> = {
  FIELD_METADATA_NOT_FOUND: msg`Field metadata not found.`,
  OBJECT_METADATA_NOT_FOUND: msg`Object metadata not found.`,
  ENUM_OPERATION_FAILED: msg`Enum operation failed.`,
  UNSUPPORTED_COMPOSITE_COLUMN_TYPE: msg`Unsupported composite column type.`,
  NOT_SUPPORTED: msg`This operation is not supported.`,
  INVALID_ACTION_TYPE: msg`Invalid action type.`,
  FLAT_ENTITY_NOT_FOUND: msg`Entity not found.`,
  INTERNAL_SERVER_ERROR: msg`An unexpected error occurred.`,
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
        workspaceMigrationRunnerExceptionUserFriendlyMessages[code],
    });
  }
}
