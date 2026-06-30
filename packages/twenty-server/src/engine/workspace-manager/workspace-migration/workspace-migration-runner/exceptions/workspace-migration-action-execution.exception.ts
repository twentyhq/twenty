import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable, CustomError } from 'twenty-shared/utils';

export const WorkspaceMigrationActionExecutionExceptionCode = {
  FIELD_METADATA_NOT_FOUND: 'FIELD_METADATA_NOT_FOUND',
  OBJECT_METADATA_NOT_FOUND: 'OBJECT_METADATA_NOT_FOUND',
  ENUM_OPERATION_FAILED: 'ENUM_OPERATION_FAILED',
  UNSUPPORTED_COMPOSITE_COLUMN_TYPE: 'UNSUPPORTED_COMPOSITE_COLUMN_TYPE',
  NOT_SUPPORTED: 'NOT_SUPPORTED',
  INVALID_ACTION_TYPE: 'INVALID_ACTION_TYPE',
  FLAT_ENTITY_NOT_FOUND: 'FLAT_ENTITY_NOT_FOUND',
  UNSUPPORTED_FIELD_METADATA_TYPE: 'UNSUPPORTED_FIELD_METADATA_TYPE',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

const getWorkspaceMigrationActionExecutionExceptionUserFriendlyMessage = (
  code: keyof typeof WorkspaceMigrationActionExecutionExceptionCode,
) => {
  switch (code) {
    case WorkspaceMigrationActionExecutionExceptionCode.FIELD_METADATA_NOT_FOUND:
      return msg`Field metadata not found.`;
    case WorkspaceMigrationActionExecutionExceptionCode.OBJECT_METADATA_NOT_FOUND:
      return msg`Object metadata not found.`;
    case WorkspaceMigrationActionExecutionExceptionCode.ENUM_OPERATION_FAILED:
      return msg`Enum operation failed.`;
    case WorkspaceMigrationActionExecutionExceptionCode.UNSUPPORTED_COMPOSITE_COLUMN_TYPE:
      return msg`Unsupported composite column type.`;
    case WorkspaceMigrationActionExecutionExceptionCode.NOT_SUPPORTED:
      return msg`This operation is not supported.`;
    case WorkspaceMigrationActionExecutionExceptionCode.INVALID_ACTION_TYPE:
      return msg`Invalid action type.`;
    case WorkspaceMigrationActionExecutionExceptionCode.FLAT_ENTITY_NOT_FOUND:
      return msg`Entity not found.`;
    case WorkspaceMigrationActionExecutionExceptionCode.UNSUPPORTED_FIELD_METADATA_TYPE:
      return msg`Unsupported field metadata type.`;
    case WorkspaceMigrationActionExecutionExceptionCode.INTERNAL_SERVER_ERROR:
      return msg`An unexpected error occurred.`;
    default:
      assertUnreachable(code);
  }
};

export class WorkspaceMigrationActionExecutionException extends CustomError {
  code: keyof typeof WorkspaceMigrationActionExecutionExceptionCode;
  userFriendlyMessage: MessageDescriptor;

  constructor({
    message,
    code,
    userFriendlyMessage,
  }: {
    message: string;
    code: keyof typeof WorkspaceMigrationActionExecutionExceptionCode;
    userFriendlyMessage?: MessageDescriptor;
  }) {
    super(message);

    this.code = code;
    this.userFriendlyMessage =
      userFriendlyMessage ??
      getWorkspaceMigrationActionExecutionExceptionUserFriendlyMessage(code);
  }
}
