import { type MessageDescriptor } from '@lingui/core';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';
import {
  DUPLICATE_ENTRY_USER_FRIENDLY_MESSAGE,
  INVALID_INPUT_USER_FRIENDLY_MESSAGE,
  QUERY_READ_TIMEOUT_USER_FRIENDLY_MESSAGE,
  TRANSIENT_DATABASE_ERROR_USER_FRIENDLY_MESSAGE,
} from 'src/engine/workspace-query-executor/constants/postgres-error-messages.constants';
import { CustomException } from 'src/utils/custom-exception';

export enum WorkspaceQueryExecutorExceptionCode {
  QUERY_READ_TIMEOUT = 'QUERY_READ_TIMEOUT',
  TRANSIENT_DATABASE_ERROR = 'TRANSIENT_DATABASE_ERROR',
  DUPLICATE_ENTRY_DETECTED = 'DUPLICATE_ENTRY_DETECTED',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_PARAMETER = 'MISSING_PARAMETER',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  MALFORMED_SQL = 'MALFORMED_SQL',
  UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION',
}

const getWorkspaceQueryExecutorExceptionUserFriendlyMessage = (
  code: WorkspaceQueryExecutorExceptionCode,
) => {
  switch (code) {
    case WorkspaceQueryExecutorExceptionCode.QUERY_READ_TIMEOUT:
      return QUERY_READ_TIMEOUT_USER_FRIENDLY_MESSAGE;
    case WorkspaceQueryExecutorExceptionCode.TRANSIENT_DATABASE_ERROR:
      return TRANSIENT_DATABASE_ERROR_USER_FRIENDLY_MESSAGE;
    case WorkspaceQueryExecutorExceptionCode.DUPLICATE_ENTRY_DETECTED:
      return DUPLICATE_ENTRY_USER_FRIENDLY_MESSAGE;
    case WorkspaceQueryExecutorExceptionCode.INVALID_INPUT:
      return INVALID_INPUT_USER_FRIENDLY_MESSAGE;
    case WorkspaceQueryExecutorExceptionCode.MISSING_PARAMETER:
    case WorkspaceQueryExecutorExceptionCode.INVALID_PARAMETER:
    case WorkspaceQueryExecutorExceptionCode.MALFORMED_SQL:
    case WorkspaceQueryExecutorExceptionCode.UNSUPPORTED_OPERATION:
      return STANDARD_ERROR_MESSAGE;
    default:
      assertUnreachable(code);
  }
};

export class WorkspaceQueryExecutorException extends CustomException<WorkspaceQueryExecutorExceptionCode> {
  constructor({
    message,
    code,
    userFriendlyMessage,
  }: {
    message: string;
    code: WorkspaceQueryExecutorExceptionCode;
    userFriendlyMessage?: MessageDescriptor;
  }) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getWorkspaceQueryExecutorExceptionUserFriendlyMessage(code),
    });
  }
}
